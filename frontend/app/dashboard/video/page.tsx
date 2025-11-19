'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from 'axios';
import { FaVideo, FaVolumeMute } from 'react-icons/fa';

export default function VideoToolsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleRemoveSound = async () => {
    if (!file) return;

    setProcessing(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/api/v1/video/remove-sound', formData, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      setDownloadUrl(url);
    } catch (error) {
      console.error('Error removing sound:', error);
      alert('Failed to remove sound. Make sure ffmpeg is installed on the server.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FaVideo className="text-violet-500" /> Video Editor
        </h1>
        <p className="text-muted-foreground">Simple video editing tools</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Remove Sound Tool */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-violet-500/10 text-violet-500">
                <FaVolumeMute size={24} />
              </div>
              <CardTitle className="text-xl">Remove Sound</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="video-upload">Upload Video</Label>
              <Input
                id="video-upload"
                type="file"
                accept="video/*"
                onChange={handleFileChange}
              />
            </div>

            {file && (
              <Button 
                className="w-full font-semibold"
                disabled={processing}
                onClick={handleRemoveSound}
              >
                {processing ? "Processing..." : "Remove Sound"}
              </Button>
            )}

            {downloadUrl && (
              <div className="p-4 rounded-lg bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-900">
                <p className="text-green-700 dark:text-green-400 font-semibold mb-2">Success! Video is ready.</p>
                <video controls src={downloadUrl} className="w-full mb-2 max-h-60" />
                <Button 
                  asChild
                  variant="outline"
                  className="w-full border-green-200 text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900/50"
                >
                  <a href={downloadUrl} download={`muted_${file?.name}`}>Download Muted Video</a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
