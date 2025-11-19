'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Download, Music, Video, Search } from "lucide-react";
import { toast } from "sonner";

interface MediaInfo {
  title: string;
  thumbnail: string;
  duration: number;
  platform: string;
  uploader: string;
}

export default function SocialsPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [mediaInfo, setMediaInfo] = useState<MediaInfo | null>(null);

  const fetchInfo = async () => {
    if (!url) return;
    setLoading(true);
    setMediaInfo(null);
    
    // Show loading toast
    const loadingToast = toast.loading("Fetching media info... This may take a few seconds.");
    
    try {
      const response = await fetch('http://localhost:8000/api/v1/socials/info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to fetch info');
      }
      
      const data = await response.json();
      setMediaInfo(data);
      toast.success("Media info fetched successfully!", { id: loadingToast });
    } catch (error: any) {
      toast.error(error.message || "Could not fetch media info. Please check the URL.", { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (type: 'video' | 'audio') => {
    if (!url) return;
    setDownloading(true);
    
    const loadingToast = toast.loading(`Downloading ${type}... This may take a while depending on file size.`);
    
    try {
      const response = await fetch(`http://localhost:8000/api/v1/socials/download?type=${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Download failed');
      }

      // Get the file as a blob
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      
      // Extract filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `social_media_${type}.${type === 'audio' ? 'mp3' : 'mp4'}`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      // Create and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the blob URL
      window.URL.revokeObjectURL(downloadUrl);

      toast.success(`${type === 'video' ? 'Video' : 'Audio'} downloaded successfully!`, { id: loadingToast });
    } catch (error: any) {
      toast.error(error.message || "Download failed. Please try again.", { id: loadingToast });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Social Media Downloader</h1>
        <p className="text-muted-foreground">
          Download videos or extract audio from Instagram, TikTok, YouTube, and more.
        </p>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle>Paste Link</CardTitle>
          <CardDescription>
            Enter the URL of the social media post you want to download. Fetching info may take 5-15 seconds.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input 
              placeholder="https://www.instagram.com/reel/..." 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchInfo()}
            />
            <Button onClick={fetchInfo} disabled={loading || !url}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              <span className="ml-2 hidden sm:inline">Fetch</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {mediaInfo && (
        <Card className="overflow-hidden border-2 animate-in zoom-in-95 duration-300">
          <div className="grid md:grid-cols-[300px_1fr] gap-6">
            <div className="aspect-[9/16] md:aspect-video relative bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={mediaInfo.thumbnail} 
                alt={mediaInfo.title} 
                className="object-cover w-full h-full"
              />
            </div>
            <div className="p-6 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wider font-semibold">
                  <span>{mediaInfo.platform}</span>
                  <span>•</span>
                  <span>{mediaInfo.uploader}</span>
                </div>
                <h3 className="text-xl font-bold line-clamp-2">{mediaInfo.title}</h3>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <Button 
                  size="lg" 
                  className="flex-1" 
                  onClick={() => handleDownload('video')}
                  disabled={downloading}
                >
                  {downloading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Video className="h-4 w-4 mr-2" />}
                  Download Video
                </Button>
                <Button 
                  size="lg" 
                  variant="secondary" 
                  className="flex-1"
                  onClick={() => handleDownload('audio')}
                  disabled={downloading}
                >
                  {downloading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Music className="h-4 w-4 mr-2" />}
                  Extract Audio
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
