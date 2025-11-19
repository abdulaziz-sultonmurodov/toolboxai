'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axios from 'axios';
import { FaFilePdf, FaImage, FaExchangeAlt } from 'react-icons/fa';

const SUPPORTED_IMAGE_FORMATS = ['png', 'jpg', 'jpeg', 'svg', 'webp', 'bmp', 'gif'];
const PDF_OUTPUT_FORMATS = ['png', 'jpg', 'jpeg', 'svg'];

export default function ConverterPage() {
  const [file, setFile] = useState<File | null>(null);
  const [detectedFormat, setDetectedFormat] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string>('auto');
  const [outputFormat, setOutputFormat] = useState<string>('png');
  const [converting, setConverting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, conversionType: 'image-to-pdf' | 'pdf-to-image') => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setMessage(null);
      
      // Create preview for images only
      if (conversionType === 'image-to-pdf') {
        const url = URL.createObjectURL(selectedFile);
        setPreviewUrl(url);
        
        // Auto-detect format from extension
        const ext = selectedFile.name.split('.').pop()?.toLowerCase();
        if (ext && SUPPORTED_IMAGE_FORMATS.includes(ext)) {
          setDetectedFormat(ext);
          setSelectedFormat('auto');
        } else {
          setDetectedFormat(null);
          setMessage('⚠ Could not detect format. Please select manually.');
        }
      } else {
        setPreviewUrl(null);
        setDetectedFormat(null);
      }
    }
  };

  const handleImageToPdf = async () => {
    if (!file) return;

    setConverting(true);
    setMessage(null);
    
    const formData = new FormData();
    formData.append('file', file);
    
    if (selectedFormat !== 'auto') {
      formData.append('format', selectedFormat);
    }

    try {
      const response = await axios.post(
        'http://localhost:8000/api/v1/converter/image-to-pdf',
        formData,
        { responseType: 'blob' }
      );
      
      const detectedFromServer = response.headers['x-detected-format'];
      if (detectedFromServer) {
        setDetectedFormat(detectedFromServer);
      }
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${file.name.split('.')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setMessage('✓ Converted and downloaded successfully!');
    } catch (error: any) {
      console.error('Conversion error:', error);
      const errorMsg = error.response?.data?.detail || error.message || 'Conversion failed';
      setMessage(`✗ ${errorMsg}`);
    } finally {
      setConverting(false);
    }
  };

  const handlePdfToImage = async () => {
    if (!file) return;

    setConverting(true);
    setMessage(null);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', outputFormat);

    try {
      const response = await axios.post(
        'http://localhost:8000/api/v1/converter/pdf-to-image',
        formData,
        { responseType: 'blob' }
      );
      
      const pageCount = response.headers['x-page-count'];
      const isZip = response.headers['content-type'] === 'application/zip';
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = isZip 
        ? `${file.name.split('.')[0]}_pages.zip`
        : `${file.name.split('.')[0]}.${outputFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      if (pageCount && parseInt(pageCount) > 1) {
        setMessage(`✓ Converted ${pageCount} pages and downloaded as ZIP!`);
      } else {
        setMessage('✓ Converted and downloaded successfully!');
      }
    } catch (error: any) {
      console.error('Conversion error:', error);
      const errorMsg = error.response?.data?.detail || error.message || 'Conversion failed';
      setMessage(`✗ ${errorMsg}`);
    } finally {
      setConverting(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setDetectedFormat(null);
    setSelectedFormat('auto');
    setMessage(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FaExchangeAlt className="text-blue-500" /> File Converter
        </h1>
        <p className="text-muted-foreground">Convert between images and PDF formats</p>
      </div>

      <Tabs defaultValue="image-to-pdf" className="w-full" onValueChange={handleReset}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="image-to-pdf">
            <FaImage className="mr-2" /> Image to PDF
          </TabsTrigger>
          <TabsTrigger value="pdf-to-image">
            <FaFilePdf className="mr-2" /> PDF to Image
          </TabsTrigger>
        </TabsList>

        {/* Image to PDF Tab */}
        <TabsContent value="image-to-pdf">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Convert Image to PDF</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="image-upload">Select Image</Label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'image-to-pdf')}
                  disabled={converting}
                />
                <p className="text-xs text-muted-foreground">
                  Supported: {SUPPORTED_IMAGE_FORMATS.join(', ').toUpperCase()}
                </p>
              </div>

              {file && (
                <div className="space-y-4">
                  {previewUrl && (
                    <div className="space-y-2">
                      <Label>Preview</Label>
                      <div className="border rounded-lg p-4 bg-muted/20 flex justify-center">
                        <img src={previewUrl} alt="Preview" className="max-h-64 object-contain rounded" />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="format-select">Image Format</Label>
                    <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                      <SelectTrigger id="format-select">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">
                          Auto-detect {detectedFormat && `(${detectedFormat.toUpperCase()})`}
                        </SelectItem>
                        {SUPPORTED_IMAGE_FORMATS.map(format => (
                          <SelectItem key={format} value={format}>{format.toUpperCase()}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1" disabled={converting} onClick={handleImageToPdf}>
                      <FaFilePdf className="mr-2" />
                      {converting ? "Converting..." : "Convert to PDF"}
                    </Button>
                    <Button variant="outline" onClick={handleReset} disabled={converting}>Reset</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* PDF to Image Tab */}
        <TabsContent value="pdf-to-image">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Convert PDF to Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="pdf-upload">Select PDF</Label>
                <Input
                  id="pdf-upload"
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => handleFileChange(e, 'pdf-to-image')}
                  disabled={converting}
                />
                <p className="text-xs text-muted-foreground">
                  Multi-page PDFs will be downloaded as a ZIP file
                </p>
              </div>

              {file && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="output-format">Output Format</Label>
                    <Select value={outputFormat} onValueChange={setOutputFormat}>
                      <SelectTrigger id="output-format">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        {PDF_OUTPUT_FORMATS.map(format => (
                          <SelectItem key={format} value={format}>{format.toUpperCase()}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1" disabled={converting} onClick={handlePdfToImage}>
                      <FaImage className="mr-2" />
                      {converting ? "Converting..." : "Convert to Images"}
                    </Button>
                    <Button variant="outline" onClick={handleReset} disabled={converting}>Reset</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${
          message.startsWith('✓') 
            ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900'
            : message.startsWith('⚠')
            ? 'bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-900'
            : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}
