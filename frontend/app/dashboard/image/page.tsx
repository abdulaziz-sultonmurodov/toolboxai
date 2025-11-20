'use client';

import { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Transformer, Rect, Text, Group } from 'react-konva';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Upload, Download, X, ZoomIn, ZoomOut, Layers, Eye, EyeOff, Lock, Unlock, Trash2, Frame
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

interface BaseLayer {
  id: string;
  name: string;
  type: 'frame' | 'image';
  x: number;
  y: number;
  locked: boolean;
  visible: boolean;
}

interface FrameLayer extends BaseLayer {
  type: 'frame';
  width: number;
  height: number;
  frameName: string;
}

interface ImageLayer extends BaseLayer {
  type: 'image';
  image: HTMLImageElement;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
  filters: FilterState;
}

type LayerType = FrameLayer | ImageLayer;

interface FramePreset {
  name: string;
  width: number;
  height: number;
  category: string;
}

const FRAME_PRESETS: FramePreset[] = [
  { name: 'iPhone 17 Pro', width: 393, height: 852, category: 'Mobile' },
  { name: 'iPhone 17 Pro Max', width: 430, height: 932, category: 'Mobile' },
  { name: 'Samsung Galaxy S24', width: 360, height: 780, category: 'Mobile' },
  { name: 'iPad Pro 12.9"', width: 1024, height: 1366, category: 'Tablet' },
  { name: 'MacBook Pro 14"', width: 1512, height: 982, category: 'Laptop' },
  { name: 'MacBook Pro 16"', width: 1728, height: 1117, category: 'Laptop' },
  { name: 'MacBook Air 13"', width: 1280, height: 832, category: 'Laptop' },
  { name: 'Desktop FHD', width: 1920, height: 1080, category: 'Desktop' },
  { name: 'Desktop QHD', width: 2560, height: 1440, category: 'Desktop' },
  { name: 'Desktop 4K', width: 3840, height: 2160, category: 'Desktop' },
  { name: 'Instagram Post', width: 1080, height: 1080, category: 'Social' },
  { name: 'Instagram Story', width: 1080, height: 1920, category: 'Social' },
  { name: 'Twitter Post', width: 1200, height: 675, category: 'Social' },
  { name: 'Facebook Cover', width: 820, height: 312, category: 'Social' },
];

const DEFAULT_FILTERS: FilterState = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  blur: 0,
  grayscale: false,
  sepia: false,
};

export default function DesignToolPage() {
  const [layers, setLayers] = useState<LayerType[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const layerRef = useRef<Konva.Layer>(null);
  
  const [stageSize, setStageSize] = useState({ width: 1200, height: 800 });
  const [stagePosition, setStagePosition] = useState({ x: 100, y: 100 });
  const [stageScale, setStageScale] = useState(0.5);
  const [cursorState, setCursorState] = useState<string>('default');

  useEffect(() => {
    const updateSize = () => {
      const container = document.getElementById('canvas-container');
      if (container) {
        setStageSize({
          width: container.offsetWidth,
          height: Math.min(container.offsetHeight, 800),
        });
      }
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleAddFrame = (frameName: string) => {
    const preset = FRAME_PRESETS.find(f => f.name === frameName);
    if (!preset) return;
    
    const scale = Math.min(1, Math.min(600 / preset.width, 600 / preset.height));
    const frameCount = layers.filter(l => l.type === 'frame').length;
    
    const newFrame: FrameLayer = {
      id: `frame-${Date.now()}`,
      name: preset.name,
      type: 'frame',
      frameName: preset.name,
      x: 200 + (frameCount * 50),
      y: 200 + (frameCount * 50),
      width: preset.width * scale,
      height: preset.height * scale,
      locked: false,
      visible: true,
    };
    
    setLayers(prev => [...prev, newFrame]);
    setSelectedLayerId(newFrame.id);
    toast.success(`Added ${preset.name} frame`);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    Array.from(files).forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          const imageCount = layers.filter(l => l.type === 'image').length;
          
          const newLayer: ImageLayer = {
            id: `image-${Date.now()}-${index}`,
            image: img,
            name: file.name,
            type: 'image',
            x: 300 + (imageCount * 30),
            y: 300 + (imageCount * 30),
            width: img.width,
            height: img.height,
            rotation: 0,
            scaleX: Math.min(300 / img.width, 1),
            scaleY: Math.min(300 / img.height, 1),
            opacity: 1,
            filters: { ...DEFAULT_FILTERS },
            locked: false,
            visible: true,
          };
          
          setLayers(prev => [...prev, newLayer]);
          setSelectedLayerId(newLayer.id);
          toast.success(`Added ${file.name}`);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
    
    e.target.value = '';
  };

  const handleLayerSelect = (layerId: string) => {
    setSelectedLayerId(layerId);
    setLayers(prev => {
      const layer = prev.find(l => l.id === layerId);
      if (!layer) return prev;
      const others = prev.filter(l => l.id !== layerId);
      return [...others, layer];
    });
  };

  useEffect(() => {
    if (!transformerRef.current) return;
    const stage = stageRef.current;
    if (!stage) return;
    
    if (selectedLayerId) {
      const selectedNode = stage.findOne(`#${selectedLayerId}`);
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
      }
    } else {
      transformerRef.current.nodes([]);
    }
    
    layerRef.current?.batchDraw();
  }, [selectedLayerId]);

  const toggleLayerVisibility = (layerId: string) => {
    setLayers(prev => prev.map(layer =>
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
    ));
  };

  const toggleLayerLock = (layerId: string) => {
    setLayers(prev => prev.map(layer =>
      layer.id === layerId ? { ...layer, locked: !layer.locked } : layer
    ));
  };

  const deleteLayer = (layerId: string) => {
    setLayers(prev => prev.filter(layer => layer.id !== layerId));
    if (selectedLayerId === layerId) {
      setSelectedLayerId(null);
    }
    toast.success("Layer deleted");
  };

  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;
    
    const isCtrl = e.evt.ctrlKey;
    const isShift = e.evt.shiftKey;
    
    if (isCtrl) {
      const newY = stagePosition.y - e.evt.deltaY;
      setStagePosition({ ...stagePosition, y: newY });
    } else if (isShift) {
      const newX = stagePosition.x - e.evt.deltaY;
      setStagePosition({ ...stagePosition, x: newX });
    } else {
      const oldScale = stageScale;
      const pointer = stage.getPointerPosition();
      if (!pointer) return;
      
      const mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
      };
      
      const scaleBy = 1.1;
      const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
      const clampedScale = Math.max(0.1, Math.min(5, newScale));
      
      setStageScale(clampedScale);
      
      const newPos = {
        x: pointer.x - mousePointTo.x * clampedScale,
        y: pointer.y - mousePointTo.y * clampedScale,
      };
      
      setStagePosition(newPos);
    }
  };

  const handleZoomIn = () => setStageScale(Math.min(5, stageScale * 1.2));
  const handleZoomOut = () => setStageScale(Math.max(0.1, stageScale / 1.2));
  const handleResetView = () => {
    setStageScale(0.5);
    setStagePosition({ x: 100, y: 100 });
  };

  const handleExport = () => {
    if (!stageRef.current) return;
    
    if (selectedLayerId) {
      const stage = stageRef.current;
      const selectedNode = stage.findOne(`#${selectedLayerId}`);
      
      if (selectedNode) {
        const uri = selectedNode.toDataURL({ pixelRatio: 2 });
        const layer = layers.find(l => l.id === selectedLayerId);
        const link = document.createElement('a');
        link.download = `${layer?.name.replace(/\s+/g, '-').toLowerCase() || 'layer'}.png`;
        link.href = uri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`Exported ${layer?.name}!`);
      }
    } else {
      const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = 'design.png';
      link.href = uri;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Exported entire canvas!");
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Design Studio</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Create stunning designs with multi-layer editing
          </p>
        </div>
        
        <Button onClick={handleExport} className="bg-gradient-to-r from-pink-500 to-violet-500">
          <Download className="h-4 w-4 mr-2" />
          {selectedLayerId ? 'Export Selected' : 'Export All'}
        </Button>
      </div>

      <div className="flex-1 grid lg:grid-cols-[280px_1fr] gap-4 min-h-0">
        <Card className="overflow-auto">
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image-upload" className="cursor-pointer">
                <div className="flex items-center gap-2 p-3 rounded-lg border-2 border-dashed hover:border-primary hover:bg-muted/50 transition-colors">
                  <Upload className="h-5 w-5" />
                  <span className="text-sm font-medium">Add Images</span>
                </div>
                <input id="image-upload" type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
              </Label>
              
              <Select onValueChange={handleAddFrame}>
                <SelectTrigger><SelectValue placeholder="Add Frame" /></SelectTrigger>
                <SelectContent>
                  {['Mobile', 'Tablet', 'Laptop', 'Desktop', 'Social'].map(category => (
                    <div key={category}>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{category}</div>
                      {FRAME_PRESETS.filter(f => f.category === category).map(frame => (
                        <SelectItem key={frame.name} value={frame.name}>{frame.name}</SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="border-t pt-4 space-y-3">
              <h3 className="font-semibold text-sm">View</h3>
              <div className="grid grid-cols-3 gap-2">
                <Button size="sm" variant="outline" onClick={handleZoomIn}><ZoomIn className="h-4 w-4" /></Button>
                <Button size="sm" variant="outline" onClick={handleZoomOut}><ZoomOut className="h-4 w-4" /></Button>
                <Button size="sm" variant="outline" onClick={handleResetView}><X className="h-4 w-4" /></Button>
              </div>
              <p className="text-xs text-muted-foreground">Zoom: {Math.round(stageScale * 100)}%</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>💡 Scroll to zoom</p>
                <p>💡 Ctrl+Scroll to pan ↕</p>
                <p>💡 Shift+Scroll to pan ↔</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Layers
                </h3>
                <span className="text-xs text-muted-foreground">{layers.length}</span>
              </div>
              
              <div className="space-y-2">
                {layers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Add frames or images to start!</p>
                ) : (
                  [...layers].reverse().map((layer) => (
                    <div
                      key={layer.id}
                      className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                        selectedLayerId === layer.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => handleLayerSelect(layer.id)}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex-shrink-0">
                          {layer.type === 'frame' ? <Frame className="h-4 w-4 text-blue-500" /> : <Upload className="h-4 w-4 text-green-500" />}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{layer.name}</p>
                          <p className="text-xs text-muted-foreground">{layer.type === 'frame' ? 'Frame' : 'Image'}</p>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); toggleLayerVisibility(layer.id); }}>
                            {layer.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                          </Button>
                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); toggleLayerLock(layer.id); }}>
                            {layer.locked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                          </Button>
                          <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={(e) => { e.stopPropagation(); deleteLayer(layer.id); }}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0 h-full">
            <div id="canvas-container" className="relative h-full bg-gray-200 rounded-lg overflow-hidden" style={{ cursor: cursorState }}>
              <Stage
                ref={stageRef}
                width={stageSize.width}
                height={stageSize.height}
                draggable={true}
                onWheel={handleWheel}
                scaleX={stageScale}
                scaleY={stageScale}
                x={stagePosition.x}
                y={stagePosition.y}
                onDragEnd={(e) => setStagePosition({ x: e.target.x(), y: e.target.y() })}
                onMouseEnter={() => setCursorState('grab')}
                onMouseDown={() => setCursorState('grabbing')}
                onMouseUp={() => setCursorState('grab')}
              >
                <Layer ref={layerRef}>
                  {layers.filter(l => l.visible).map((layer) => {
                    if (layer.type === 'frame') {
                      return (
                        <Group key={layer.id} id={layer.id}>
                          <Rect
                            x={layer.x}
                            y={layer.y}
                            width={layer.width}
                            height={layer.height}
                            fill="white"
                            shadowColor="black"
                            shadowBlur={20}
                            shadowOpacity={0.15}
                            shadowOffsetY={5}
                            draggable={!layer.locked}
                            onClick={() => handleLayerSelect(layer.id)}
                            onTap={() => handleLayerSelect(layer.id)}
                            onDragEnd={(e) => {
                              const node = e.target;
                              setLayers(prev => prev.map(l => l.id === layer.id ? { ...l, x: node.x(), y: node.y() } : l));
                            }}
                          />
                          <Text x={layer.x} y={layer.y - 25} text={layer.frameName} fontSize={14} fill="#666" fontStyle="bold" />
                        </Group>
                      );
                    } else {
                      return (
                        <KonvaImage
                          key={layer.id}
                          id={layer.id}
                          image={layer.image}
                          x={layer.x}
                          y={layer.y}
                          width={layer.width}
                          height={layer.height}
                          scaleX={layer.scaleX}
                          scaleY={layer.scaleY}
                          rotation={layer.rotation}
                          opacity={layer.opacity}
                          draggable={!layer.locked}
                          onClick={() => handleLayerSelect(layer.id)}
                          onTap={() => handleLayerSelect(layer.id)}
                          onDragEnd={(e) => {
                            const node = e.target;
                            setLayers(prev => prev.map(l => l.id === layer.id ? { ...l, x: node.x(), y: node.y() } : l));
                          }}
                          onTransformEnd={(e) => {
                            const node = e.target;
                            setLayers(prev => prev.map(l =>
                              l.id === layer.id ? { ...l, x: node.x(), y: node.y(), scaleX: node.scaleX(), scaleY: node.scaleY(), rotation: node.rotation() } : l
                            ));
                          }}
                        />
                      );
                    }
                  })}
                  
                  <Transformer
                    ref={transformerRef}
                    boundBoxFunc={(oldBox, newBox) => {
                      if (newBox.width < 20 || newBox.height < 20) return oldBox;
                      return newBox;
                    }}
                  />
                </Layer>
              </Stage>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
