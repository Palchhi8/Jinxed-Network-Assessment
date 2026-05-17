'use client';

import { useState, useEffect } from 'react';
import { Container } from '@/components/Container';
import {
  Sparkles,
  ArrowRight,
  Loader2,
  Image as ImageIcon,
  AlertTriangle,
  Sliders,
  Download,
  Info
} from 'lucide-react';
import { Generation, GenerationSettings } from '@/types';
import { GallerySection } from '@/components/GallerySection';
import { Toaster, toast } from 'sonner';

const SUGGESTIONS = [
  {
    label: "Cyberpunk Metropolis",
    text: "A futuristic cyberpunk metropolis at night, glowing neon towers, rainy streets reflecting lights, 8k, ultra-detailed",
    icon: "🌌",
    category: "Sci-Fi"
  },
  {
    label: "Bioluminescent Forest",
    text: "A mystical bioluminescent forest at twilight, glowing fairy mushrooms, soft sunbeams filtering through mossy trees, ethereal",
    icon: "🍄",
    category: "Fantasy"
  },
  {
    label: "Holographic Workspace",
    text: "A clean minimalist workspace with holographic glassmorphism screens floating, warm orange ambient lighting, technical details",
    icon: "💼",
    category: "Modern"
  }
];

const MODELS = [
  { id: 'stabilityai/stable-diffusion-xl-base-1.0', name: 'SDXL 1.0 High-Resolution (Free)', desc: 'Full composition depth and artistic detail' }
];

export default function Home() {
  // State variables
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<string>('');
  const [currentGeneration, setCurrentGeneration] = useState<Generation | null>(null);
  const [generationHistory, setGenerationHistory] = useState<Generation[]>([]);
  const [isGalleryLoading, setIsGalleryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all generations from database on component mount
  useEffect(() => {
    let active = true;
    const fetchOnMount = async () => {
      try {
        const response = await fetch('/api/generate');
        if (response.ok && active) {
          const data = await response.json();
          setGenerationHistory(data);
        }
      } catch (err) {
        console.error('Failed to load gallery history:', err);
      } finally {
        if (active) {
          setIsGalleryLoading(false);
        }
      }
    };
    fetchOnMount();
    return () => {
      active = false;
    };
  }, []);

  // Helper to refresh gallery after dynamic event triggers (like prompt execution)
  const refreshGallery = async () => {
    try {
      const response = await fetch('/api/generate');
      if (response.ok) {
        const data = await response.json();
        setGenerationHistory(data);
      }
    } catch (err) {
      console.error('Failed to refresh gallery:', err);
    }
  };

  // Advanced configurations
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [model, setModel] = useState('stabilityai/stable-diffusion-xl-base-1.0');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [guidanceScale, setGuidanceScale] = useState(7.5);
  const [steps, setSteps] = useState(30);

  // Quick suggestion click
  const handleSuggestionClick = (text: string) => {
    setPrompt(text);
  };

  // Run Hugging Face generative cycle
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setError(null);
    setLoadingStatus('Queueing generation task...');
    toast.info('Initiating prompt synthesis pipeline...', {
      description: 'Contacting Hugging Face neural inference engine.',
    });

    // Simulate multi-step loading UX for a realistic feel
    const statusSteps = [
      { msg: 'Queueing generation task...', delay: 0 },
      { msg: 'Allocating GPU core compute resources...', delay: 600 },
      { msg: 'Synthesizing pixel diffusion blocks...', delay: 1400 },
      { msg: 'Finalizing high-fidelity rendering...', delay: 2100 }
    ];

    statusSteps.forEach((step) => {
      setTimeout(() => {
        if (isGenerating) {
          setLoadingStatus(step.msg);
        }
      }, step.delay);
    });

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          model,
          settings: {
            aspectRatio,
            guidanceScale,
            steps,
            seed: Math.floor(Math.random() * 999999),
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Generative workflow crashed unexpectedly.');
      }

      // Add to generation record
      setCurrentGeneration(data);
      toast.success('Asset generated successfully!', {
        description: 'Instantly synced in Supabase history.',
      });
      
      // Refresh the gallery instantly from the backend
      await refreshGallery();
    } catch (err) {
      console.error(err);
      const errorText = err instanceof Error ? err.message : 'Failed to communicate with the generator endpoint.';
      setError(errorText);
      toast.error('Generation pipeline failed', {
        description: errorText,
      });
      
      // Refresh the gallery even on failure to show the FAILED record immediately
      await refreshGallery();
    } finally {
      setIsGenerating(false);
      setLoadingStatus('');
    }
  };

  // Use values from a previous generation to tweak/regenerate
  const handleTweak = (historyItem: Generation) => {
    setPrompt(historyItem.prompt);
    if (historyItem.model) setModel(historyItem.model);
    if (historyItem.settings) {
      if (historyItem.settings.aspectRatio) setAspectRatio(historyItem.settings.aspectRatio);
      if (historyItem.settings.guidanceScale) setGuidanceScale(historyItem.settings.guidanceScale);
      if (historyItem.settings.steps) setSteps(historyItem.settings.steps);
    }
    toast.success('Studio configuration recalled!', {
      description: 'Prompt and advanced settings populated.',
    });
    // Scroll smoothly back to top prompt interface
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };



  return (
    <div className="flex-grow flex flex-col pb-20">
      {/* Background radial highlight glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 h-[500px] w-full max-w-[1200px] bg-gradient-radial from-violet-500/10 via-transparent to-transparent opacity-70 pointer-events-none" />

      <Container className="pt-10 lg:pt-16 max-w-5xl space-y-12">
        {/* Header Introduction */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-950/20 px-3.5 py-1 text-xs text-violet-300 font-medium">
            <Sparkles className="h-3.5 w-3.5 text-violet-400" />
            <span>High-Fidelity AI Workspace</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-100">
            Generative Media <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">Studio</span>
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
            Formulate detailed prompts, customize generative settings, and construct stunning visual digital assets in real-time.
          </p>
        </div>

        {/* Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Creator Panel */}
          <div className="lg:col-span-7 space-y-6">
            <form onSubmit={handleSubmit} className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 shadow-2xl backdrop-blur-md space-y-4">
              {/* Text Prompt Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 tracking-wider uppercase flex items-center justify-between">
                  <span>Enter Text Prompt</span>
                  <span className="text-[10px] text-zinc-500 font-normal normal-case">Supports up to 2000 chars</span>
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={isGenerating}
                  placeholder="Describe your creative vision in rich, detailed prose... (e.g. 'A bioluminescent glowing jellyfish in deep blue cosmic dust')"
                  rows={4}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-200 placeholder-zinc-500 outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all duration-200 resize-none disabled:opacity-50"
                />
              </div>

              {/* Advanced Configurations Drawer Button */}
              <div className="border-t border-zinc-850 pt-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    showAdvanced 
                      ? 'border-violet-500/30 bg-violet-950/20 text-violet-300' 
                      : 'border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  <Sliders className="h-3.5 w-3.5" />
                  <span>Advanced Settings</span>
                </button>

                <div className="text-[11px] text-zinc-500 flex items-center gap-1.5 font-mono">
                  <Info className="h-3 w-3 text-zinc-600" />
                  <span>Hugging Face Diffusion Core</span>
                </div>
              </div>

              {/* Advanced Settings Panels */}
              {showAdvanced && (
                <div className="border border-zinc-850 bg-zinc-950/40 rounded-xl p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Model Picker */}
                    <div className="col-span-2 space-y-1.5">
                      <label className="text-xs text-zinc-400">Generative Model</label>
                      <select
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-300 outline-none focus:border-violet-500/50"
                      >
                        {MODELS.map(m => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Aspect Ratio */}
                    <div className="space-y-1.5">
                      <label className="text-xs text-zinc-400">Aspect Ratio</label>
                      <div className="grid grid-cols-3 gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                        {['1:1', '16:9', '9:16'].map(ratio => (
                          <button
                            type="button"
                            key={ratio}
                            onClick={() => setAspectRatio(ratio)}
                            className={`py-1 text-[10px] font-semibold rounded-md transition-all ${
                              aspectRatio === ratio
                                ? 'bg-zinc-800 text-violet-300 border border-violet-500/20 shadow'
                                : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                          >
                            {ratio}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Guidance Scale */}
                    <div className="space-y-1.5">
                      <label className="text-xs text-zinc-400 flex justify-between">
                        <span>Prompt Weight</span>
                        <span className="text-[10px] text-zinc-500 font-semibold">{guidanceScale}</span>
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="15"
                        step="0.5"
                        value={guidanceScale}
                        onChange={(e) => setGuidanceScale(parseFloat(e.target.value))}
                        className="w-full accent-violet-500 h-1.5 rounded-lg bg-zinc-800 cursor-pointer"
                      />
                    </div>

                    {/* Inference Steps */}
                    <div className="col-span-2 space-y-1.5">
                      <label className="text-xs text-zinc-400 flex justify-between">
                        <span>Quality Steps</span>
                        <span className="text-[10px] text-zinc-500 font-semibold">{steps} steps</span>
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="50"
                        step="5"
                        value={steps}
                        onChange={(e) => setSteps(parseInt(e.target.value))}
                        className="w-full accent-violet-500 h-1.5 rounded-lg bg-zinc-800 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Submit / Trigger Button */}
              <button
                type="submit"
                disabled={!prompt.trim() || isGenerating}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    <span>Generating High-Res Image...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-white" />
                    <span>Generate Masterpiece</span>
                    <ArrowRight className="h-4 w-4 text-white" />
                  </>
                )}
              </button>
            </form>

            {/* Suggestions Panel */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-zinc-500 tracking-wider uppercase">Quick Suggestion Templates</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion.label}
                    onClick={() => handleSuggestionClick(suggestion.text)}
                    disabled={isGenerating}
                    type="button"
                    className="flex flex-col text-left p-3.5 rounded-xl border border-zinc-850 bg-zinc-950/40 hover:bg-zinc-900/60 hover:border-zinc-800 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-lg mb-1">{suggestion.icon}</span>
                    <span className="text-xs font-bold text-zinc-300 group-hover:text-violet-300 transition-colors">{suggestion.label}</span>
                    <span className="text-[10px] text-zinc-500 mt-1 line-clamp-2 leading-relaxed">{suggestion.text}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Rendering Display */}
          <div className="lg:col-span-5 space-y-6">
            {/* Visual Canvas State */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 shadow-2xl backdrop-blur-md flex flex-col items-center justify-center min-h-[360px] relative overflow-hidden">
              {/* Default State: No image generated yet */}
              {!currentGeneration && !isGenerating && !error && (
                <div className="text-center py-12 px-6 space-y-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-950/50 border border-zinc-800 text-zinc-500">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-zinc-300">Studio Canvas Empty</h3>
                    <p className="text-xs text-zinc-500 max-w-[240px] mx-auto">
                      Formulate a text prompt on the left and trigger generation to render your canvas.
                    </p>
                  </div>
                </div>
              )}

              {/* Generating/Loading State */}
              {isGenerating && (
                <div className="text-center py-12 px-6 space-y-6 flex flex-col items-center justify-center w-full">
                  {/* Glowing Loading Pulse Box */}
                  <div className="relative h-44 w-44 rounded-2xl border border-zinc-800 bg-zinc-950/60 flex items-center justify-center shadow-inner overflow-hidden animate-pulse">
                    <Loader2 className="h-8 w-8 animate-spin text-violet-400 absolute" />
                    {/* Faux pixel blocks representation */}
                    <div className="absolute inset-0 bg-gradient-radial from-violet-500/10 via-transparent to-transparent" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-1.5 justify-center">
                      <span className="h-2 w-2 rounded-full bg-violet-500 animate-ping" />
                      Diffusion Process Running
                    </h3>
                    <p className="text-xs text-violet-400 font-semibold font-mono tracking-wide">
                      {loadingStatus || 'Synthesizing creative asset...'}
                    </p>
                  </div>
                </div>
              )}

              {/* Error Output */}
              {error && !isGenerating && (
                <div className="text-center py-12 px-6 space-y-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-red-950/30 border border-red-500/20 text-red-400">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-red-400">Generation Failed</h3>
                    <p className="text-xs text-zinc-500 max-w-[260px] mx-auto leading-relaxed">
                      {error}
                    </p>
                  </div>
                </div>
              )}

              {/* Completed Rendered Image */}
              {currentGeneration && !isGenerating && !error && (
                <div className="w-full space-y-4 animate-in fade-in zoom-in-95 duration-300">
                  <div className="relative group rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={currentGeneration.imageUrl || '/placeholders/placeholder_3.png'}
                      alt={currentGeneration.prompt}
                      className="w-full h-auto aspect-video sm:aspect-square object-cover"
                    />

                    {/* Image Hover Quick Controls */}
                    <div className="absolute inset-0 bg-zinc-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity duration-200">
                      <a
                        href={currentGeneration.imageUrl || '#'}
                        download={`studio_${currentGeneration.id}.png`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 hover:text-white hover:border-zinc-700 transition-colors"
                        title="Download Asset"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </div>
                  </div>

                  {/* Render Metadata */}
                  <div className="border border-zinc-850 bg-zinc-950/40 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-500">Model used:</span>
                      <span className="font-semibold text-zinc-300 font-mono">{currentGeneration.model}</span>
                    </div>
                    {currentGeneration.settings && (
                      <div className="grid grid-cols-2 gap-y-1.5 text-[10px] text-zinc-400 border-t border-zinc-850 pt-2">
                        <div className="flex items-center gap-1">
                          <span className="text-zinc-600">Aspect Ratio:</span>
                          <span className="font-bold text-zinc-300">{(currentGeneration.settings as GenerationSettings).aspectRatio || '1:1'}</span>
                        </div>
                        <div className="flex items-center gap-1 justify-end">
                          <span className="text-zinc-600">Steps:</span>
                          <span className="font-bold text-zinc-300">{(currentGeneration.settings as GenerationSettings).steps || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-zinc-600">Scale Weight:</span>
                          <span className="font-bold text-zinc-300">{(currentGeneration.settings as GenerationSettings).guidanceScale || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1 justify-end">
                          <span className="text-zinc-600">Seed:</span>
                          <span className="font-bold text-zinc-300 font-mono">{(currentGeneration.settings as GenerationSettings).seed || '0'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Studio Gallery */}
        <GallerySection
          generations={generationHistory}
          isLoading={isGalleryLoading}
          onTweak={handleTweak}
          isGenerating={isGenerating}
        />
      </Container>
      
      {/* Toast provider container */}
      <Toaster theme="dark" position="bottom-right" richColors closeButton />
    </div>
  );
}
