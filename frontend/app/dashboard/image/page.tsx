'use client';

import { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Transformer, Rect } from 'react-konva';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { 
  Upload, Crop, Sliders, RotateCw, FlipHorizontal, FlipVertical,
  Undo, Redo, Download, X, ZoomIn, ZoomOut
} from "lucide-react";
import { toast } from "sonner";
import Konva from 'konva';

interface FilterState {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  grayscale: boolean;
  sepia: boolean;
}

interface HistoryState {
  imageData: string;
  filters: FilterState;
}

export default function ImageEditorPage() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [activeTool, setActiveTool] = useState<'crop' | 'filter' | 'transform' | null>(null);
  const [isTransforming, setIsTransforming] = useState(false);
  
  // Canvas state
  const stageRef = useRef<Konva.Stage>(null);
  const imageRef = useRef<Konva.Image>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const layerRef = useRef<Konva.Layer>(null);
  
  // Dimensions
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [scale, setScale] = useState(1);
  
  // Pan and Zoom
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  const [stageScale, setStageScale] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState<FilterState>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    blur: 0,
    grayscale: false,
    sepia: false,
  });
  
  // History
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Crop
  const [cropRect, setCropRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [aspectRatio, setAspectRatio] = useState<'free' | '1:1' | '16:9' | '4:3'>('free');

  // Update stage size on window resize
  useEffect(() => {
    const updateSize = () => {
      const container = document.getElementById('canvas-container');
      if (container) {
        setStageSize({
          width: container.offsetWidth,
          height: Math.min(container.offsetHeight, 600),
        });
      }
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Apply filters to image
  useEffect(() => {
    if (!imageRef.current) return;
    
    const filterArray: any[] = [];
    
    if (filters.brightness !== 0) {
      filterArray.push(Konva.Filters.Brighten);
    }
    if (filters.contrast !== 0) {
      filterArray.push(Konva.Filters.Contrast);
    }
    if (filters.blur > 0) {
      filterArray.push(Konva.Filters.Blur);
    }
    if (filters.grayscale) {
      filterArray.push(Konva.Filters.Grayscale);
    }
    if (filters.sepia) {
      filterArray.push(Konva.Filters.Sepia);
    }
    
    imageRef.current.filters(filterArray);
    imageRef.current.brightness(filters.brightness / 100);
    imageRef.current.contrast(filters.contrast);
    imageRef.current.blurRadius(filters.blur);
    imageRef.current.cache();
    layerRef.current?.batchDraw();
  }, [filters]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        setImage(img);
        setOriginalImage(img);
        
        // Fit image to stage
        const scaleX = stageSize.width / img.width;
        const scaleY = stageSize.height / img.height;
        const newScale = Math.min(scaleX, scaleY, 1);
        setScale(newScale);
        
        // Reset state
        setFilters({
          brightness: 0,
          contrast: 0,
          saturation: 0,
          blur: 0,
          grayscale: false,
          sepia: false,
        });
        setHistory([]);
        setHistoryIndex(-1);
        setCropRect(null);
        setActiveTool(null);
        
        toast.success("Image loaded successfully!");
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleCropStart = () => {
    if (!image) {
      toast.error("Please upload an image first");
      return;
    }
    
    setActiveTool('crop');
    setIsTransforming(true);
    
    // Initialize crop rectangle
    const width = image.width * scale * 0.8;
    const height = image.height * scale * 0.8;
    const x = (stageSize.width - width) / 2;
    const y = (stageSize.height - height) / 2;
    
    setCropRect({ x, y, width, height });
    
    // Attach transformer
    if (transformerRef.current && imageRef.current) {
      transformerRef.current.nodes([imageRef.current]);
      layerRef.current?.batchDraw();
    }
  };

  const handleCropApply = () => {
    if (!cropRect || !imageRef.current || !stageRef.current) return;
    
    const stage = stageRef.current;
    const imageNode = imageRef.current;
    
    // Calculate crop area in image coordinates
    const scaleX = imageNode.scaleX() || 1;
    const scaleY = imageNode.scaleY() || 1;
    
    const cropX = (cropRect.x - imageNode.x()) / scaleX;
    const cropY = (cropRect.y - imageNode.y()) / scaleY;
    const cropWidth = cropRect.width / scaleX;
    const cropHeight = cropRect.height / scaleY;
    
    // Create cropped image
    imageNode.crop({
      x: cropX,
      y: cropY,
      width: cropWidth,
      height: cropHeight,
    });
    
    imageNode.position({ x: cropRect.x, y: cropRect.y });
    imageNode.size({ width: cropRect.width, height: cropRect.height });
    
    setCropRect(null);
    setIsTransforming(false);
    setActiveTool(null);
    
    if (transformerRef.current) {
      transformerRef.current.nodes([]);
    }
    
    layerRef.current?.batchDraw();
    toast.success("Image cropped!");
  };

  const handleRotate = () => {
    if (!imageRef.current) return;
    
    const currentRotation = imageRef.current.rotation();
    imageRef.current.rotation(currentRotation + 90);
    layerRef.current?.batchDraw();
    toast.success("Image rotated!");
  };

  const handleFlipHorizontal = () => {
    if (!imageRef.current) return;
    
    const currentScaleX = imageRef.current.scaleX();
    imageRef.current.scaleX(-currentScaleX);
    layerRef.current?.batchDraw();
    toast.success("Image flipped horizontally!");
  };

  const handleFlipVertical = () => {
    if (!imageRef.current) return;
    
    const currentScaleY = imageRef.current.scaleY();
    imageRef.current.scaleY(-currentScaleY);
    layerRef.current?.batchDraw();
    toast.success("Image flipped vertically!");
  };

  const handleDownload = () => {
    if (!stageRef.current) return;
    
    const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
    const link = document.createElement('a');
    link.download = 'edited-image.png';
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Image downloaded!");
  };

  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    
    const stage = stageRef.current;
    if (!stage) return;
    
    // Check if Ctrl key is pressed
    if (!e.evt.ctrlKey) return;
    
    const oldScale = stageScale;
    const pointer = stage.getPointerPosition();
    
    if (!pointer) return;
    
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };
    
    // Zoom in/out
    const scaleBy = 1.1;
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    
    // Limit zoom range
    const clampedScale = Math.max(0.1, Math.min(5, newScale));
    
    setStageScale(clampedScale);
    
    // Adjust position to zoom towards mouse pointer
    const newPos = {
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    };
    
    setStagePosition(newPos);
  };
  
  const handleZoomIn = () => {
    const newScale = Math.min(5, stageScale * 1.2);
    setStageScale(newScale);
  };
  
  const handleZoomOut = () => {
    const newScale = Math.max(0.1, stageScale / 1.2);
    setStageScale(newScale);
  };
  
  const handleResetView = () => {
    setStageScale(1);
    setStagePosition({ x: 0, y: 0 });
  };

  const handleReset = () => {
    if (!originalImage) return;
    
    setImage(originalImage);
    setFilters({
      brightness: 0,
      contrast: 0,
      saturation: 0,
      blur: 0,
      grayscale: false,
      sepia: false,
    });
    setCropRect(null);
    setActiveTool(null);
    setIsTransforming(false);
    
    if (imageRef.current) {
      imageRef.current.rotation(0);
      imageRef.current.scaleX(scale);
      imageRef.current.scaleY(scale);
      imageRef.current.crop(undefined);
    }
    
    toast.success("Image reset to original!");
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Image Editor</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Upload an image and edit it with powerful tools
        </p>
      </div>

      {/* Main Editor */}
      <div className="grid lg:grid-cols-[280px_1fr] gap-4 sm:gap-6">
        {/* Toolbar */}
        <Card className="h-fit">
          <CardContent className="p-4 space-y-4">
            {/* Upload */}
            <div>
              <Label htmlFor="image-upload" className="cursor-pointer">
                <div className="flex items-center gap-2 p-3 rounded-lg border-2 border-dashed hover:border-primary hover:bg-muted/50 transition-colors">
                  <Upload className="h-5 w-5" />
                  <span className="text-sm font-medium">Upload Image</span>
                </div>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </Label>
            </div>

            {image && (
              <>
                <div className="border-t pt-4 space-y-3">
                  <h3 className="font-semibold text-sm">Tools</h3>
                  
                  {/* Crop Tool */}
                  <Button
                    variant={activeTool === 'crop' ? 'default' : 'outline'}
                    className="w-full justify-start"
                    onClick={handleCropStart}
                    disabled={isTransforming}
                  >
                    <Crop className="h-4 w-4 mr-2" />
                    Crop
                  </Button>

                  {/* Filter Tool */}
                  <Button
                    variant={activeTool === 'filter' ? 'default' : 'outline'}
                    className="w-full justify-start"
                    onClick={() => setActiveTool(activeTool === 'filter' ? null : 'filter')}
                  >
                    <Sliders className="h-4 w-4 mr-2" />
                    Filters
                  </Button>

                  {/* Transform Tool */}
                  <Button
                    variant={activeTool === 'transform' ? 'default' : 'outline'}
                    className="w-full justify-start"
                    onClick={() => setActiveTool(activeTool === 'transform' ? null : 'transform')}
                  >
                    <RotateCw className="h-4 w-4 mr-2" />
                    Transform
                  </Button>
                </div>

                {/* Crop Controls */}
                {activeTool === 'crop' && cropRect && (
                  <div className="border-t pt-4 space-y-3">
                    <h3 className="font-semibold text-sm">Crop Settings</h3>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleCropApply} className="flex-1">
                        Apply
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setCropRect(null);
                          setActiveTool(null);
                          setIsTransforming(false);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Filter Controls */}
                {activeTool === 'filter' && (
                  <div className="border-t pt-4 space-y-4">
                    <h3 className="font-semibold text-sm">Adjust Filters</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs">Brightness: {filters.brightness}</Label>
                        <Slider
                          value={[filters.brightness]}
                          onValueChange={([v]) => setFilters({ ...filters, brightness: v })}
                          min={-100}
                          max={100}
                          step={1}
                        />
                      </div>

                      <div>
                        <Label className="text-xs">Contrast: {filters.contrast}</Label>
                        <Slider
                          value={[filters.contrast]}
                          onValueChange={([v]) => setFilters({ ...filters, contrast: v })}
                          min={-100}
                          max={100}
                          step={1}
                        />
                      </div>

                      <div>
                        <Label className="text-xs">Blur: {filters.blur}</Label>
                        <Slider
                          value={[filters.blur]}
                          onValueChange={([v]) => setFilters({ ...filters, blur: v })}
                          min={0}
                          max={20}
                          step={1}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={filters.grayscale ? 'default' : 'outline'}
                          onClick={() => setFilters({ ...filters, grayscale: !filters.grayscale })}
                          className="flex-1"
                        >
                          Grayscale
                        </Button>
                        <Button
                          size="sm"
                          variant={filters.sepia ? 'default' : 'outline'}
                          onClick={() => setFilters({ ...filters, sepia: !filters.sepia })}
                          className="flex-1"
                        >
                          Sepia
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Transform Controls */}
                {activeTool === 'transform' && (
                  <div className="border-t pt-4 space-y-3">
                    <h3 className="font-semibold text-sm">Transform</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <Button size="sm" variant="outline" onClick={handleRotate}>
                        <RotateCw className="h-4 w-4 mr-1" />
                        Rotate
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleFlipHorizontal}>
                        <FlipHorizontal className="h-4 w-4 mr-1" />
                        Flip H
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleFlipVertical} className="col-span-2">
                        <FlipVertical className="h-4 w-4 mr-1" />
                        Flip Vertical
                      </Button>
                    </div>
                  </div>
                )}

                {/* Zoom Controls */}
                <div className="border-t pt-4 space-y-3">
                  <h3 className="font-semibold text-sm">View Controls</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <Button size="sm" variant="outline" onClick={handleZoomIn} title="Zoom In">
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleZoomOut} title="Zoom Out">
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleResetView} title="Reset View">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Zoom: {Math.round(stageScale * 100)}%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    💡 Ctrl+Scroll to zoom, drag to pan
                  </p>
                </div>

                {/* Actions */}
                <div className="border-t pt-4 space-y-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleReset}
                  >
                    Reset Image
                  </Button>
                  <Button
                    className="w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600"
                    onClick={handleDownload}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Canvas Area */}
        <Card>
          <CardContent className="p-4">
            <div
              id="canvas-container"
              className="relative bg-muted/30 rounded-lg overflow-hidden"
              style={{ height: '600px' }}
            >
              {!image ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Upload className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Upload an image to start editing</p>
                    <p className="text-sm">Supports PNG, JPEG, WEBP</p>
                  </div>
                </div>
              ) : (
                <Stage
                  ref={stageRef}
                  width={stageSize.width}
                  height={stageSize.height}
                  draggable={!isTransforming}
                  onWheel={handleWheel}
                  scaleX={stageScale}
                  scaleY={stageScale}
                  x={stagePosition.x}
                  y={stagePosition.y}
                  onDragEnd={(e) => {
                    setStagePosition({
                      x: e.target.x(),
                      y: e.target.y(),
                    });
                  }}
                >
                  <Layer ref={layerRef}>
                    <KonvaImage
                      ref={imageRef}
                      image={image}
                      x={(stageSize.width - image.width * scale) / 2}
                      y={(stageSize.height - image.height * scale) / 2}
                      scaleX={scale}
                      scaleY={scale}
                      draggable={isTransforming}
                    />
                    
                    {cropRect && (
                      <>
                        <Rect
                          x={cropRect.x}
                          y={cropRect.y}
                          width={cropRect.width}
                          height={cropRect.height}
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dash={[10, 5]}
                          listening={false}
                        />
                        <Transformer
                          ref={transformerRef}
                          boundBoxFunc={(oldBox, newBox) => {
                            if (newBox.width < 50 || newBox.height < 50) {
                              return oldBox;
                            }
                            return newBox;
                          }}
                        />
                      </>
                    )}
                  </Layer>
                </Stage>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
