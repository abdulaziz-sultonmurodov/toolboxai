'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import axios from 'axios';
import { FaMusic, FaCut, FaTachometerAlt, FaDownload, FaTrash } from 'react-icons/fa';

export default function AudioToolsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [trimRange, setTrimRange] = useState<number[]>([0, 10]);
  const [speed, setSpeed] = useState([1.0]);
  const [processing, setProcessing] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Get audio duration for UI
      const audio = new Audio(URL.createObjectURL(selectedFile));
      audio.onloadedmetadata = () => {
        setDuration(audio.duration);
        setTrimRange([0, audio.duration]);
      };
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setProcessing(true);
    setMessage(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/api/v1/audio/upload', formData);
      setFileId(response.data.file_id);
      setDuration(response.data.duration);
      setTrimRange([0, response.data.duration]);
      setMessage(`✓ Uploaded: ${response.data.filename}`);
      
      // Create audio URL for preview
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
    } catch (error: any) {
      console.error('Error uploading audio:', error);
      setMessage(`✗ Upload failed: ${error.response?.data?.detail || error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleTrim = async () => {
    if (!fileId) return;

    setProcessing(true);
    setMessage(null);
    const formData = new FormData();
    formData.append('start_time', trimRange[0].toString());
    formData.append('end_time', trimRange[1].toString());

    try {
      const response = await axios.post(`http://localhost:8000/api/v1/audio/trim/${fileId}`, formData);
      setDuration(response.data.duration);
      setTrimRange([0, response.data.duration]);
      setMessage(`✓ Trimmed successfully! New duration: ${response.data.duration.toFixed(2)}s`);
      
      // Refresh audio preview
      await refreshAudio();
    } catch (error: any) {
      console.error('Error trimming audio:', error);
      setMessage(`✗ Trim failed: ${error.response?.data?.detail || error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleSpeedChange = async () => {
    if (!fileId) return;

    setProcessing(true);
    setMessage(null);
    const formData = new FormData();
    formData.append('speed', speed[0].toString());

    try {
      const response = await axios.post(`http://localhost:8000/api/v1/audio/speed/${fileId}`, formData);
      setDuration(response.data.duration);
      setTrimRange([0, response.data.duration]);
      
      const warningMsg = response.data.warning ? ` (${response.data.warning})` : '';
      setMessage(`✓ ${response.data.message}${warningMsg}`);
      
      // Refresh audio preview
      await refreshAudio();
    } catch (error: any) {
      console.error('Error changing speed:', error);
      setMessage(`✗ Speed change failed: ${error.response?.data?.detail || error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const refreshAudio = async () => {
    if (!fileId) return;
    
    try {
      const response = await axios.get(`http://localhost:8000/api/v1/audio/download/${fileId}`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      setAudioUrl(url);
    } catch (error) {
      console.error('Error refreshing audio:', error);
    }
  };

  const handleDownload = async () => {
    if (!fileId) return;

    try {
      const response = await axios.get(`http://localhost:8000/api/v1/audio/download/${fileId}`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `processed_${file?.name || 'audio.mp3'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setMessage('✓ Downloaded successfully!');
    } catch (error: any) {
      console.error('Error downloading audio:', error);
      setMessage(`✗ Download failed: ${error.response?.data?.detail || error.message}`);
    }
  };

  const handleDelete = async () => {
    if (!fileId) return;

    try {
      await axios.delete(`http://localhost:8000/api/v1/audio/delete/${fileId}`);
      setFileId(null);
      setFile(null);
      setAudioUrl(null);
      setMessage('✓ File deleted');
    } catch (error: any) {
      console.error('Error deleting audio:', error);
      setMessage(`✗ Delete failed: ${error.response?.data?.detail || error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FaMusic className="text-pink-500" /> Audio Studio
        </h1>
        <p className="text-muted-foreground">Upload once, apply multiple operations</p>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Upload Audio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="audio-upload">Select Audio File</Label>
            <Input
              id="audio-upload"
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              disabled={!!fileId}
            />
          </div>

          {file && !fileId && (
            <Button 
              className="w-full font-semibold"
              disabled={processing}
              onClick={handleUpload}
            >
              {processing ? "Uploading..." : "Upload Audio"}
            </Button>
          )}

          {message && (
            <div className={`p-3 rounded-lg text-sm ${
              message.startsWith('✓') 
                ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900'
                : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900'
            }`}>
              {message}
            </div>
          )}

          {audioUrl && (
            <div className="space-y-2">
              <Label>Audio Preview</Label>
              <audio controls src={audioUrl} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Operations Section */}
      {fileId && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trim Tool */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-pink-500/10 text-pink-500">
                  <FaCut size={24} />
                </div>
                <CardTitle className="text-xl">Trim Audio</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Start: {trimRange[0].toFixed(2)}s</span>
                <span>End: {trimRange[1].toFixed(2)}s</span>
              </div>
              <div className="space-y-2">
                <Label>Trim Range</Label>
                <Slider 
                  step={0.1} 
                  min={0} 
                  max={duration} 
                  value={trimRange} 
                  onValueChange={setTrimRange}
                  className="py-4"
                />
              </div>
              
              <Button 
                className="w-full font-semibold"
                disabled={processing}
                onClick={handleTrim}
              >
                {processing ? "Processing..." : "Apply Trim"}
              </Button>
            </CardContent>
          </Card>

          {/* Speed Tool */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-violet-500/10 text-violet-500">
                  <FaTachometerAlt size={24} />
                </div>
                <CardTitle className="text-xl">Speed Control</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Speed: {speed[0]}x</span>
              </div>
              <div className="space-y-2">
                <Label>Playback Speed</Label>
                <Slider 
                  step={0.1} 
                  min={0.5} 
                  max={2.0} 
                  value={speed} 
                  onValueChange={setSpeed}
                  className="py-4"
                />
              </div>
              
              <Button 
                className="w-full font-semibold"
                disabled={processing}
                onClick={handleSpeedChange}
              >
                {processing ? "Processing..." : "Apply Speed Change"}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Download/Delete Section */}
      {fileId && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Button 
                className="flex-1 font-semibold"
                onClick={handleDownload}
              >
                <FaDownload className="mr-2" /> Download Processed Audio
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDelete}
              >
                <FaTrash className="mr-2" /> Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
