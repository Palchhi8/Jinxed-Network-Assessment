import { Generation } from '@/types';
import { GenerationCard } from './GenerationCard';
import { Clock, Image as ImageIcon } from 'lucide-react';

interface GallerySectionProps {
  generations: Generation[];
  isLoading: boolean;
  onTweak: (item: Generation) => void;
  isGenerating?: boolean;
}

export function GallerySection({ generations, isLoading, onTweak, isGenerating }: GallerySectionProps) {
  return (
    <div className="space-y-6 border-t border-zinc-850 pt-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-zinc-300 tracking-wide uppercase flex items-center gap-2">
          <Clock className="h-4 w-4 text-violet-400" />
          <span>Generative Studio Gallery</span>
        </h2>

        {!isLoading && generations.length > 0 && (
          <span className="text-[11px] text-zinc-500 font-mono">
            {generations.length} {generations.length === 1 ? 'generation' : 'generations'} recorded
          </span>
        )}
      </div>

      {/* Loading Skeleton State */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((num) => (
            <div key={num} className="rounded-2xl border border-zinc-800 bg-zinc-900/5 p-4 space-y-4 animate-pulse">
              <div className="rounded-xl bg-zinc-950 aspect-video w-full border border-zinc-900" />
              <div className="space-y-3">
                <div className="h-3 bg-zinc-800 rounded-md w-1/4" />
                <div className="h-2.5 bg-zinc-800 rounded-md w-full" />
                <div className="h-2.5 bg-zinc-800 rounded-md w-5/6" />
              </div>
              <div className="border-t border-zinc-850/60 pt-3 mt-3 flex justify-between items-center">
                <div className="h-4 bg-zinc-800 rounded-md w-1/3" />
                <div className="h-4 bg-zinc-800 rounded-md w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : generations.length === 0 ? (
        /* Elegant Premium Empty State */
        <div className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/10 p-16 text-center max-w-xl mx-auto space-y-6 shadow-sm shadow-zinc-950/20">
          <div className="absolute -inset-x-20 -top-20 h-40 bg-violet-600/5 blur-3xl pointer-events-none rounded-full" />
          
          <div className="relative inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 text-violet-400/80 shadow-inner shadow-violet-500/5">
            <ImageIcon className="h-7 w-7" />
          </div>
          
          <div className="relative space-y-2">
            <h3 className="text-base font-bold text-zinc-200 tracking-tight">Start creating your first AI masterpiece</h3>
            <p className="text-xs text-zinc-500 max-w-[320px] mx-auto leading-relaxed">
              Your generation history is currently empty. Enter a descriptive text prompt above to authorize the neural engine and begin your creative workflow.
            </p>
          </div>
        </div>
      ) : (
        /* Real Generations Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {generations.map((item) => (
            <GenerationCard
              key={item.id}
              item={item}
              onTweak={onTweak}
              disabled={isGenerating}
            />
          ))}
        </div>
      )}
    </div>
  );
}
