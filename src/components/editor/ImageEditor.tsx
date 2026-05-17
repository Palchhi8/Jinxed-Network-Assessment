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

        // 1. Detect and calculate container bounds safely
        const containerWidth = containerRef.current ? Math.floor(containerRef.current.clientWidth * 0.6) : 800;
        const containerHeight = containerRef.current ? Math.floor(containerRef.current.clientHeight * 0.8) : 600;

        // 2. Detect original image width and height
        const img = await fabricModule.FabricImage.fromURL(imageUrl, {
          crossOrigin: 'anonymous',
        });

        if (!active) {
          return;
        }

        // 3. Apply proportional scaling logic to container limits
        const scaleX = containerWidth / img.width!;
        const scaleY = containerHeight / img.height!;
        // Use Math.min to constrain dimensions within view while keeping aspect ratio intact
        const scaleFactor = Math.min(scaleX, scaleY, 1);

        // Shrink-wrap the canvas exactly to the new scaled dimensions to drop all empty black space
        const canvasWidth = img.width! * scaleFactor;
        const canvasHeight = img.height! * scaleFactor;

        // Initialize Fabric Canvas instance
        fabricCanvas = new fabricModule.Canvas(canvasRef.current, {
          width: canvasWidth,
          height: canvasHeight,
          selection: false,
          backgroundColor: '#09090b',
        });

        // 4. Apply scale to the fabric image object natively
        img.scale(scaleFactor);

        // 5. Center image perfectly using center origins
        img.set({
          left: canvasWidth / 2,
          top: canvasHeight / 2,
          originX: 'center',
          originY: 'center',
          selectable: false,
          evented: false,
        });

        // 6. Call renderAll
        // Use add and sendObjectToBack instead of backgroundImage so originX/Y logic executes flawlessly
        fabricCanvas.add(img);
        fabricCanvas.sendObjectToBack(img);
        fabricCanvas.renderAll();

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
      shadow: new fabricModule.Shadow({
        color: 'rgba(0,0,0,0.8)',
        blur: 6,
        offsetX: 0,
        offsetY: 2
      })
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
      
      toast.success('Image exported successfully', {
        duration: 3000,
      });
    } catch (err) {
      console.error('Failed to export canvas image:', err);
      toast.error('Image export failed due to security canvas locks.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        ref={containerRef}
        className="w-full max-w-6xl bg-zinc-900 border border-zinc-800/80 rounded-2xl shadow-2xl shadow-zinc-950/50 overflow-hidden flex flex-col lg:flex-row max-h-[95vh] lg:max-h-[85vh] animate-in zoom-in-95 duration-300 ease-out"
      >
        {/* Left Side: Canvas Studio Workspace */}
        <div className="flex-[2] p-6 lg:p-8 bg-zinc-950 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-zinc-800/60 relative overflow-y-auto min-h-[40vh] lg:min-h-[600px]">
          <button 
            onClick={onClose}
            className="absolute top-4 lg:top-6 right-4 lg:right-6 h-8 w-8 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 flex items-center justify-center transition-colors z-10"
          >
            <X className="h-4 w-4" />
          </button>
          
          <div className="w-full flex flex-col items-center justify-center space-y-6 my-auto">
            <span className="text-[10px] font-bold text-zinc-500 font-mono uppercase tracking-wider block">
              Creative Canvas Suite
            </span>
            
            {/* The polished adaptive Canvas wrapper */}
            <div className="rounded-xl overflow-hidden border border-zinc-800/60 bg-zinc-900/20 shadow-2xl shadow-zinc-950/50 transition-all duration-300">
              <canvas ref={canvasRef} id="editor-canvas" className="block" />
            </div>
            
            <p className="text-xs text-zinc-500 italic max-w-md mx-auto text-center line-clamp-2 leading-relaxed px-4">
              &ldquo;{prompt}&rdquo;
            </p>
          </div>
        </div>

        {/* Right Side: Tool & Properties Dashboard */}
        <div className="w-full lg:w-96 p-6 lg:p-8 flex flex-col justify-between bg-zinc-900 space-y-8 overflow-y-auto">
          <div className="space-y-8">
            <div className="space-y-2">
              <h3 className="text-base font-bold text-zinc-100 tracking-tight">Studio Tools</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Overlay elegant typography and reposition headers to seamlessly brand your generated assets.
              </p>
            </div>

            {/* Core Action Tools */}
            <div className="space-y-3">
              <button
                onClick={handleAddText}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-900/20 transition-all duration-200 cursor-pointer"
              >
                <Type className="h-4 w-4" />
                <span>Add Text Overlay</span>
              </button>

              {hasActiveObject && (
                <button
                  onClick={handleDeleteSelected}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-950/30 border border-red-900/40 text-red-400 hover:bg-red-900/40 hover:text-red-300 px-4 py-3.5 text-xs font-bold transition-all duration-200 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Remove Selected Layer</span>
                </button>
              )}
            </div>

            {/* Typography Controls Panel */}
            <div className="border-t border-zinc-800/80 pt-6 space-y-5">
              <h4 className="text-[10px] font-bold text-zinc-500 font-mono uppercase tracking-wider flex items-center gap-2">
                <span className="h-px bg-zinc-800 flex-1"></span>
                Typography Config
                <span className="h-px bg-zinc-800 flex-1"></span>
              </h4>

              {!hasActiveObject ? (
                <div className="bg-zinc-950/40 rounded-xl border border-zinc-800/60 p-5 text-center shadow-inner">
                  <p className="text-xs text-zinc-400 leading-relaxed italic">
                    Add text overlays to personalize your AI artwork.
                  </p>
                </div>
              ) : (
                <>
                  {/* Font Size slider */}
                  <div className="space-y-2 bg-zinc-950/40 p-4 rounded-xl border border-zinc-800/60 shadow-inner">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-400 font-semibold">Scale / Size</span>
                      <span className="text-zinc-300 font-mono font-bold px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded">{fontSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="12"
                      max="120"
                      value={fontSize}
                      onChange={(e) => handleFontSizeChange(parseInt(e.target.value))}
                      className="w-full accent-violet-500 hover:accent-violet-400 h-1.5 rounded-lg bg-zinc-800 cursor-pointer transition-all duration-200"
                    />
                  </div>

                  {/* Font Weight */}
                  <div className="flex items-center justify-between text-xs bg-zinc-950/40 p-3.5 rounded-xl border border-zinc-800/60 shadow-inner">
                    <span className="text-zinc-400 font-semibold">Strong Weight</span>
                    <button
                      onClick={handleToggleBold}
                      className={`h-8 w-8 rounded-md border flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm ${
                        isBold
                          ? 'bg-violet-600 border-violet-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.5)]'
                          : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                      }`}
                    >
                      <Bold className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Color Presets */}
                  <div className="space-y-3 bg-zinc-950/40 p-4 rounded-xl border border-zinc-800/60 shadow-inner">
                    <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                      <Palette className="h-3.5 w-3.5 text-zinc-500" />
                      <span>Color Palette</span>
                    </span>
                    <div className="grid grid-cols-6 gap-2">
                      {PRESET_COLORS.map((preset) => (
                        <button
                          key={preset.value}
                          onClick={() => handleColorChange(preset.value)}
                          style={{ backgroundColor: preset.value }}
                          className={`h-7 rounded-md border-2 cursor-pointer transition-all duration-200 shadow-sm ${
                            textColor.toLowerCase() === preset.value.toLowerCase()
                              ? 'border-zinc-200 ring-2 ring-violet-500/50 scale-110 z-10 shadow-[0_0_10px_rgba(255,255,255,0.3)]'
                              : 'border-zinc-800/50 hover:scale-105'
                          }`}
                          title={preset.name}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Export / Dismiss Actions */}
          <div className="border-t border-zinc-800/80 pt-6 mt-6 space-y-3">
            <button
              onClick={handleExport}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 px-4 py-4 text-sm font-bold text-white shadow-lg shadow-violet-900/30 transition-all duration-300 hover:shadow-[0_0_20px_rgba(217,70,239,0.4)] cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>Export Final Image</span>
            </button>
            <button
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 hover:text-white hover:border-zinc-600 px-4 py-3.5 text-xs font-semibold text-zinc-300 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
            >
              <span>Close Workspace</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
