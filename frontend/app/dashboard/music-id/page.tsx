"use client";

import { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Mic,
  Upload,
  Music,
  ExternalLink,
  StopCircle,
  Play,
  Pause,
} from "lucide-react";
import { toast } from "sonner";

interface SongResult {
  recognized: boolean;
  title?: string;
  artist?: string;
  album?: string;
  release_date?: string;
  label?: string;
  album_art?: string;
  spotify_url?: string;
  apple_music_url?: string;
  preview_url?: string;
  message?: string;
}

export default function MusicIDPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SongResult | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioLevels, setAudioLevels] = useState<number[]>([
    0, 0, 0, 0, 0, 0, 0, 0,
  ]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      // Setup audio visualization
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 32;
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      // Start visualization
      const visualize = () => {
        if (!analyserRef.current) return;
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        const levels = Array.from(dataArray)
          .slice(0, 8)
          .map((v) => v / 255);
        setAudioLevels(levels);
        animationFrameRef.current = requestAnimationFrame(visualize);
      };
      visualize();

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());

        // Stop visualization
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
        setAudioLevels([0, 0, 0, 0, 0, 0, 0, 0]);

        // Auto-identify the song
        await identifySong(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setResult(null);

      // Start timer - auto-stop at 30 seconds
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1;
          if (newTime >= 30) {
            stopRecording();
          }
          return newTime;
        });
      }, 1000);

      toast.success("Listening to music... Will auto-stop at 30 seconds");
    } catch (error) {
      toast.error("Failed to access microphone. Please grant permission.");
      console.error(error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioBlob(file);
      setResult(null);
      // Auto-identify uploaded file
      identifySong(file);
      toast.success(`Analyzing "${file.name}"...`);
    }
  };

  const identifySong = async (blob?: Blob) => {
    const audioToIdentify = blob || audioBlob;

    if (!audioToIdentify) {
      toast.error("Please record audio or upload a file first.");
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading(
      "Identifying song... This may take 10-20 seconds."
    );

    try {
      const formData = new FormData();
      formData.append("file", audioToIdentify, "recording.webm");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/music-id/recognize`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to identify song");
      }

      const data: SongResult = await response.json();
      setResult(data);

      if (data.recognized) {
        toast.success(`Song identified: ${data.title} by ${data.artist}`, {
          id: loadingToast,
        });
      } else {
        toast.error(
          "Song not recognized. Try playing the music louder or closer to the microphone.",
          {
            id: loadingToast,
            duration: 5000,
          }
        );
      }
    } catch (error: any) {
      toast.error(
        error.message || "Failed to identify song. Please try again.",
        { id: loadingToast }
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => setIsPlaying(false);
    const handlePause = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("play", handlePlay);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("play", handlePlay);
    };
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Music ID</h1>
        <p className="text-muted-foreground">
          Identify any song by recording audio or uploading a file. Like Shazam,
          but built into your toolkit!
        </p>
      </div>

      {/* Recording Controls */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Listen to Music</CardTitle>
          <CardDescription>
            Start listening for up to 30 seconds or upload an audio file. Song
            will be identified automatically!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {!isRecording ? (
              <Button
                size="lg"
                className="flex-1"
                onClick={startRecording}
                disabled={loading}
              >
                <Mic className="h-5 w-5 mr-2" />
                Start Listening
              </Button>
            ) : (
              <Button
                size="lg"
                variant="destructive"
                className="flex-1"
                onClick={stopRecording}
              >
                <StopCircle className="h-5 w-5 mr-2" />
                Stop Listening ({formatTime(recordingTime)}/30s)
              </Button>
            )}

            <Button
              size="lg"
              variant="outline"
              className="flex-1"
              onClick={() => fileInputRef.current?.click()}
              disabled={isRecording || loading}
            >
              <Upload className="h-5 w-5 mr-2" />
              Upload File
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {isRecording && (
            <div className="space-y-4 p-6 bg-gradient-to-r from-pink-500/10 to-violet-500/10 border border-pink-500/20 rounded-lg">
              <div className="flex items-center justify-center gap-3">
                <div className="h-3 w-3 bg-pink-500 rounded-full animate-pulse" />
                <span className="text-lg font-semibold">
                  Listening... {formatTime(recordingTime)}/30s
                </span>
              </div>

              {/* Audio Waveform Visualization */}
              <div className="flex items-center justify-center gap-1 h-16">
                {audioLevels.map((level, i) => (
                  <div
                    key={i}
                    className="w-2 bg-gradient-to-t from-pink-500 to-violet-500 rounded-full transition-all duration-75"
                    style={{ height: `${Math.max(level * 100, 10)}%` }}
                  />
                ))}
              </div>
            </div>
          )}

          {loading && !isRecording && (
            <div className="flex items-center justify-center gap-3 p-6 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
              <span className="text-lg font-semibold">Identifying song...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card className="border-2 overflow-hidden animate-in zoom-in-95 duration-300">
          {result.recognized ? (
            <div className="grid md:grid-cols-[300px_1fr] gap-6">
              {/* Album Art */}
              <div className="aspect-square relative bg-gradient-to-br from-pink-500/20 to-violet-500/20">
                {result.album_art ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={result.album_art}
                    alt={result.title}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Music className="h-24 w-24 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Song Details */}
              <div className="p-6 flex flex-col justify-between">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                      Song Title
                    </p>
                    <h2 className="text-3xl font-bold">{result.title}</h2>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                      Artist
                    </p>
                    <p className="text-xl">{result.artist}</p>
                  </div>

                  {result.album && result.album !== "Unknown" && (
                    <div>
                      <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                        Album
                      </p>
                      <p className="text-lg">{result.album}</p>
                    </div>
                  )}

                  {result.release_date && (
                    <div>
                      <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                        Release Date
                      </p>
                      <p className="text-lg">{result.release_date}</p>
                    </div>
                  )}
                </div>

                {/* Preview Player or Message */}
                <div className="mt-6">
                  {result.preview_url ? (
                    <div className="p-4 bg-muted/50 rounded-lg border">
                      <div className="flex items-center gap-4">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-12 w-12 rounded-full"
                          onClick={togglePlayPause}
                        >
                          {isPlaying ? (
                            <Pause className="h-5 w-5" />
                          ) : (
                            <Play className="h-5 w-5 ml-0.5" />
                          )}
                        </Button>
                        <div className="flex-1">
                          <p className="text-sm font-semibold mb-1">
                            Preview (30 seconds)
                          </p>
                          <div className="flex items-center gap-1">
                            {[...Array(20)].map((_, i) => (
                              <div
                                key={i}
                                className={`h-1 w-full rounded-full transition-all ${
                                  isPlaying
                                    ? "bg-gradient-to-r from-pink-500 to-violet-500 animate-pulse"
                                    : "bg-muted-foreground/30"
                                }`}
                                style={{
                                  height: isPlaying
                                    ? `${Math.random() * 16 + 4}px`
                                    : "4px",
                                  animationDelay: `${i * 0.05}s`,
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <audio ref={audioRef} src={result.preview_url} />
                    </div>
                  ) : (
                    <div className="p-4 bg-muted/30 rounded-lg border border-dashed text-center">
                      <Music className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                      <p className="text-sm text-muted-foreground">
                        Preview not available for this track
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        Listen on Spotify or Apple Music
                      </p>
                    </div>
                  )}
                </div>

                {/* Streaming Links */}
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  {result.spotify_url && (
                    <Button
                      size="lg"
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      asChild
                    >
                      <a
                        href={result.spotify_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open in Spotify
                      </a>
                    </Button>
                  )}
                  {result.apple_music_url && (
                    <Button
                      size="lg"
                      variant="secondary"
                      className="flex-1"
                      asChild
                    >
                      <a
                        href={result.apple_music_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open in Apple Music
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <CardContent className="p-8 text-center">
              <Music className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">
                Song Not Recognized
              </h3>
              <p className="text-muted-foreground">
                {result.message ||
                  "Try recording a longer sample or ensure the audio is clear and recognizable."}
              </p>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}
