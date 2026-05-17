/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useRef, useState } from 'react';
import { Type, Download, Trash2, X, Bold, Palette } from 'lucide-react';
import { toast } from 'sonner';

// Fabric.js types and objects are dynamically imported client-side
let fabricModule: any = null;

interface ImageEditorProps {
  imageUrl: string;
  prompt: string;
  onClose: () => void;
}

const PRESET_COLORS = [
  { name: 'White', value: '#ffffff' },
  { name: 'Violet', value: '#a78bfa' },
  { name: 'Yellow', value: '#fbbf24' },
  { name: 'Cyan', value: '#22d3ee' },
  { name: 'Red', value: '#f87171' },
  { name: 'Emerald', value: '#34d399' }
];

export function ImageEditor({ imageUrl, prompt, onClose }: ImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [canvasInstance, setCanvasInstance] = useState<any>(null);
  const [hasActiveObject, setHasActiveObject] = useState(false);
  
  // Text Overlay styling state
  const [fontSize, setFontSize] = useState(32);
  const [textColor, setTextColor] = useState('#ffffff');
  const [isBold, setIsBold] = useState(true);

  // Initialize Fabric.js Canvas inside Client-Only Effect
  useEffect(() => {
    let active = true;
    let fabricCanvas: any = null;

    const initFabric = async () => {
      try {
        // Dynamic import to prevent Server Side Rendering (SSR) issues
        if (!fabricModule) {
          fabricModule = await import('fabric');
        }

        if (!active || !canvasRef.current || !containerRef.current) return;

        // Calculate responsive size to fit modal layout (max 500x500 or container size)
        const maxWidth = Math.min(containerRef.current.clientWidth - 32, 500);
        const maxHeight = 400;

        // Initialize Fabric Canvas instance
        fabricCanvas = new fabricModule.Canvas(canvasRef.current, {
          width: maxWidth,
          height: maxHeight,
          backgroundColor: '#09090b',
        });

        // Load background image
        // In Fabric v6/v7: FabricImage.fromURL is the Promise-based API
        const img = await fabricModule.FabricImage.fromURL(imageUrl, {
          crossOrigin: 'anonymous',
        });

        if (!active) {
          fabricCanvas.dispose();
          return;
        }

        // Scale image to fit canvas bounds preserving ratio
        const scaleX = maxWidth / img.width!;
        const scaleY = maxHeight / img.height!;
        const scale = Math.min(scaleX, scaleY);

        img.set({
          scaleX: scale,
          scaleY: scale,
          left: (maxWidth - img.width! * scale) / 2,
          top: (maxHeight - img.height! * scale) / 2,
          selectable: false,
          evented: false,
        });

        // Set as background image
        fabricCanvas.add(img);
        fabricCanvas.sendObjectToBack(img);

        // Configure event listeners to capture selected text states
        fabricCanvas.on('selection:created', () => setHasActiveObject(true));
        fabricCanvas.on('selection:updated', () => setHasActiveObject(true));
        fabricCanvas.on('selection:cleared', () => setHasActiveObject(false));

        setCanvasInstance(fabricCanvas);
      } catch (err) {
        console.error('Failed to initialize canvas editor:', err);
        toast.error('Could not initialize canvas editor pipeline.');
      }
    };

    initFabric();

    return () => {
      active = false;
      if (fabricCanvas) {
        fabricCanvas.dispose();
      }
    };
  }, [imageUrl]);

  // Sync state from active object selection
  useEffect(() => {
    if (!canvasInstance) return;

    const handleSelection = () => {
      const activeObj = canvasInstance.getActiveObject();
      if (activeObj && activeObj.type === 'itext') {
        setFontSize(activeObj.fontSize || 32);
        setTextColor(activeObj.fill || '#ffffff');
        setIsBold(activeObj.fontWeight === 'bold');
      }
    };

    canvasInstance.on('selection:created', handleSelection);
    canvasInstance.on('selection:updated', handleSelection);
    
    return () => {
      canvasInstance.off('selection:created', handleSelection);
      canvasInstance.off('selection:updated', handleSelection);
    };
  }, [canvasInstance]);

  // Add movable text overlay
  const handleAddText = () => {
    if (!canvasInstance || !fabricModule) return;

    const text = new fabricModule.IText('AI Generated', {
      left: canvasInstance.width! / 2,
      top: canvasInstance.height! / 2,
      fontSize: fontSize,
      fill: textColor,
      fontWeight: isBold ? 'bold' : 'normal',
      fontFamily: 'system-ui, sans-serif',
      originX: 'center',
      originY: 'center',
      cornerColor: '#a78bfa',
      cornerSize: 8,
      transparentCorners: false,
      borderStrokeWidth: 1,
      borderColor: '#a78bfa',
    });

    canvasInstance.add(text);
    canvasInstance.setActiveObject(text);
    canvasInstance.renderAll();
    toast.success('Text overlay placed!', {
      description: 'Drag, resize, or double-click to edit text.',
    });
  };

  // Delete active text overlay
  const handleDeleteSelected = () => {
    if (!canvasInstance) return;
    const activeObj = canvasInstance.getActiveObject();
    if (activeObj) {
      canvasInstance.remove(activeObj);
      canvasInstance.discardActiveObject();
      canvasInstance.renderAll();
      setHasActiveObject(false);
      toast.info('Text overlay removed.');
    }
  };

  // Modify active font size
  const handleFontSizeChange = (size: number) => {
    setFontSize(size);
    if (!canvasInstance) return;
    const activeObj = canvasInstance.getActiveObject();
    if (activeObj && activeObj.type === 'itext') {
      activeObj.set('fontSize', size);
      canvasInstance.renderAll();
    }
  };

  // Modify active text color
  const handleColorChange = (color: string) => {
    setTextColor(color);
    if (!canvasInstance) return;
    const activeObj = canvasInstance.getActiveObject();
    if (activeObj && activeObj.type === 'itext') {
      activeObj.set('fill', color);
      canvasInstance.renderAll();
    }
  };

  // Toggle active font weight (bold / normal)
  const handleToggleBold = () => {
    const nextBold = !isBold;
    setIsBold(nextBold);
    if (!canvasInstance) return;
    const activeObj = canvasInstance.getActiveObject();
    if (activeObj && activeObj.type === 'itext') {
      activeObj.set('fontWeight', nextBold ? 'bold' : 'normal');
      canvasInstance.renderAll();
    }
  };

  // Export and download edited canvas as PNG
  const handleExport = () => {
    if (!canvasInstance) return;

    try {
      // De-select active bounding boxes before export
      canvasInstance.discardActiveObject();
      canvasInstance.renderAll();

      const dataUrl = canvasInstance.toDataURL({
        format: 'png',
        quality: 1.0,
      });

      const link = document.createElement('a');
      link.download = `jinxed_edit_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      
      toast.success('Edited image downloaded!', {
        description: 'Canvas layers flattened into export asset.',
      });
    } catch (err) {
      console.error('Failed to export canvas image:', err);
      toast.error('Image export failed due to security canvas locks.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        ref={containerRef}
        className="w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] md:max-h-none"
      >
        {/* Left Side: Canvas Studio Workspace */}
        <div className="flex-1 p-6 bg-zinc-950 flex items-center justify-center border-b md:border-b-0 md:border-r border-zinc-800 relative min-h-[300px] md:min-h-[450px]">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 h-8 w-8 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center hover:border-zinc-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          
          <div className="space-y-4 text-center">
            <span className="text-[10px] font-bold text-zinc-500 font-mono uppercase tracking-wider block">
              Canvas Studio
            </span>
            <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950/40 p-2 shadow-inner">
              <canvas ref={canvasRef} id="editor-canvas" className="mx-auto" />
            </div>
            <p className="text-[10px] text-zinc-500 italic max-w-xs mx-auto line-clamp-1">
              &ldquo;{prompt}&rdquo;
            </p>
          </div>
        </div>

        {/* Right Side: Tool & Properties Dashboard */}
        <div className="w-full md:w-80 p-6 flex flex-col justify-between bg-zinc-900 space-y-6">
          <div className="space-y-6">
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-zinc-200">Creative Editor</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Overlay typography, reposition headers, and brand your custom AI outputs.
              </p>
            </div>

            {/* Core Tools */}
            <div className="space-y-4">
              <button
                onClick={handleAddText}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 px-4 py-3 text-xs font-bold text-white shadow transition-all duration-200 cursor-pointer"
              >
                <Type className="h-4 w-4" />
                <span>Add Text Overlay</span>
              </button>

              {hasActiveObject && (
                <button
                  onClick={handleDeleteSelected}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-950/20 border border-red-900/30 text-red-400 hover:bg-red-950/40 px-4 py-3 text-xs font-bold transition-all duration-200 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Remove Selected</span>
                </button>
              )}
            </div>

            {/* Typography Controls Panel */}
            <div className="border-t border-zinc-800/80 pt-4 space-y-4">
              <h4 className="text-[10px] font-bold text-zinc-400 font-mono uppercase tracking-wider">
                Typography settings
              </h4>

              {/* Font Size slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Font Size</span>
                  <span className="text-zinc-300 font-mono font-bold">{fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="80"
                  value={fontSize}
                  onChange={(e) => handleFontSizeChange(parseInt(e.target.value))}
                  className="w-full accent-violet-500 h-1.5 rounded bg-zinc-850 cursor-pointer"
                />
              </div>

              {/* Font Weight */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Bold Weight</span>
                <button
                  onClick={handleToggleBold}
                  className={`h-8 w-8 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                    isBold
                      ? 'bg-violet-950/20 border-violet-500/30 text-violet-300'
                      : 'bg-zinc-950/40 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <Bold className="h-4 w-4" />
                </button>
              </div>

              {/* Color Presets */}
              <div className="space-y-2">
                <span className="text-xs text-zinc-400 flex items-center gap-1.5">
                  <Palette className="h-3.5 w-3.5 text-zinc-500" />
                  <span>Text Color</span>
                </span>
                <div className="grid grid-cols-6 gap-2">
                  {PRESET_COLORS.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => handleColorChange(preset.value)}
                      style={{ backgroundColor: preset.value }}
                      className={`h-6 rounded-md border cursor-pointer transition-all ${
                        textColor.toLowerCase() === preset.value.toLowerCase()
                          ? 'border-violet-400 ring-2 ring-violet-500/20 scale-105'
                          : 'border-zinc-800 hover:scale-105'
                      }`}
                      title={preset.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Export / Dismiss Actions */}
          <div className="border-t border-zinc-800/80 pt-4 space-y-2">
            <button
              onClick={handleExport}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 px-4 py-3 text-xs font-bold text-white shadow-lg transition-all duration-200 cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>Download Edited Image</span>
            </button>
            <button
              onClick={onClose}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950/40 hover:bg-zinc-900/60 hover:text-white px-4 py-3 text-xs font-semibold text-zinc-400 transition-all cursor-pointer"
            >
              Close Studio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
