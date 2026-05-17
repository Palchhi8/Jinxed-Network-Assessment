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
            <div key={num} className="rounded-xl border border-zinc-850 bg-zinc-900/10 p-3 space-y-4 animate-pulse">
              <div className="rounded-lg bg-zinc-950 aspect-video w-full" />
              <div className="space-y-2">
                <div className="h-2.5 bg-zinc-800 rounded w-1/3" />
                <div className="h-2 bg-zinc-800 rounded w-full" />
                <div className="h-2 bg-zinc-800 rounded w-5/6" />
              </div>
              <div className="border-t border-zinc-850/60 pt-3 mt-3 flex justify-between items-center">
                <div className="h-4 bg-zinc-800 rounded w-1/4" />
                <div className="h-3 bg-zinc-800 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : generations.length === 0 ? (
        /* Elegant Empty State */
        <div className="rounded-2xl border border-zinc-850 bg-zinc-900/10 p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-950/40 border border-zinc-850 text-zinc-600">
            <ImageIcon className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-zinc-300">No Generations Recorded</h3>
            <p className="text-xs text-zinc-500 max-w-[260px] mx-auto leading-relaxed">
              Your creation history is currently empty. Describe your creative vision above to kick off the studio.
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
