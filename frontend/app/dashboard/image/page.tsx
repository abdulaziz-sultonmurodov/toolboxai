'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axios from 'axios';
import { FaImage, FaCrop, FaMagic } from 'react-icons/fa';

export default function ImageToolsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Crop State
  const [cropValues, setCropValues] = useState({ left: 0, top: 0, right: 100, bottom: 100 });
  const [cropProcessing, setCropProcessing] = useState(false);
  const [cropDownloadUrl, setCropDownloadUrl] = useState<string | null>(null);

  // Filter State
  const [filterType, setFilterType] = useState("grayscale");
  const [filterProcessing, setFilterProcessing] = useState(false);
  const [filterDownloadUrl, setFilterDownloadUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      
      // Reset states
      setCropDownloadUrl(null);
      setFilterDownloadUrl(null);
    }
  };

  const handleCrop = async () => {
    if (!file) return;

    setCropProcessing(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('left', cropValues.left.toString());
    formData.append('top', cropValues.top.toString());
    formData.append('right', cropValues.right.toString());
    formData.append('bottom', cropValues.bottom.toString());

    try {
      const response = await axios.post('http://localhost:8000/api/v1/image/crop', formData, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      setCropDownloadUrl(url);
    } catch (error) {
      console.error('Error cropping image:', error);
      alert('Failed to crop image.');
    } finally {
      setCropProcessing(false);
    }
  };

  const handleFilter = async () => {
    if (!file) return;

    setFilterProcessing(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('filter_type', filterType);

    try {
      const response = await axios.post('http://localhost:8000/api/v1/image/filter', formData, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      setFilterDownloadUrl(url);
    } catch (error) {
      console.error('Error applying filter:', error);
      alert('Failed to apply filter.');
    } finally {
      setFilterProcessing(false);
    }
  };

  const filters = [
    { label: "Grayscale", value: "grayscale" },
    { label: "Blur", value: "blur" },
    { label: "Contour", value: "contour" },
    { label: "Detail", value: "detail" },
    { label: "Edge Enhance", value: "edge_enhance" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FaImage className="text-cyan-500" /> Image Lab
        </h1>
        <p className="text-muted-foreground">Enhance your photos with ease</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Label htmlFor="image-upload">Upload Image</Label>
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
          {previewUrl && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Original Image:</p>
              <img src={previewUrl} alt="Preview" className="max-h-60 rounded-lg object-contain" />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crop Tool */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-500">
                <FaCrop size={24} />
              </div>
              <CardTitle className="text-xl">Crop Image</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Left</Label>
                <Input type="number" value={cropValues.left} onChange={(e) => setCropValues({...cropValues, left: parseInt(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <Label>Top</Label>
                <Input type="number" value={cropValues.top} onChange={(e) => setCropValues({...cropValues, top: parseInt(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <Label>Right</Label>
                <Input type="number" value={cropValues.right} onChange={(e) => setCropValues({...cropValues, right: parseInt(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <Label>Bottom</Label>
                <Input type="number" value={cropValues.bottom} onChange={(e) => setCropValues({...cropValues, bottom: parseInt(e.target.value)})} />
              </div>
            </div>

            <Button 
              className="w-full font-semibold"
              disabled={!file || cropProcessing}
              onClick={handleCrop}
            >
              {cropProcessing ? "Processing..." : "Crop Image"}
            </Button>

            {cropDownloadUrl && (
              <div className="p-4 rounded-lg bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-900">
                <p className="text-green-700 dark:text-green-400 font-semibold mb-2">Success!</p>
                <img src={cropDownloadUrl} alt="Cropped" className="w-full mb-2 rounded-lg" />
                <Button 
                  asChild
                  variant="outline"
                  className="w-full border-green-200 text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900/50"
                >
                  <a href={cropDownloadUrl} download={`cropped_${file?.name}`}>Download</a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Filter Tool */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-500">
                <FaMagic size={24} />
              </div>
              <CardTitle className="text-xl">Apply Filters</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Select Filter</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a filter" />
                </SelectTrigger>
                <SelectContent>
                  {filters.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              className="w-full font-semibold"
              disabled={!file || filterProcessing}
              onClick={handleFilter}
            >
              {filterProcessing ? "Processing..." : "Apply Filter"}
            </Button>

            {filterDownloadUrl && (
              <div className="p-4 rounded-lg bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-900">
                <p className="text-green-700 dark:text-green-400 font-semibold mb-2">Success!</p>
                <img src={filterDownloadUrl} alt="Filtered" className="w-full mb-2 rounded-lg" />
                <Button 
                  asChild
                  variant="outline"
                  className="w-full border-green-200 text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900/50"
                >
                  <a href={filterDownloadUrl} download={`filtered_${file?.name}`}>Download</a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
