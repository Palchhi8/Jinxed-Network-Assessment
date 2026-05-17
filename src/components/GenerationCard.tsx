import { Generation, GenerationSettings } from '@/types';
import { Download, RefreshCcw, Check, Loader2, AlertTriangle } from 'lucide-react';

interface GenerationCardProps {
  item: Generation;
  onTweak: (item: Generation) => void;
  onEdit?: (item: Generation) => void;
  disabled?: boolean;
}

export function GenerationCard({ item, onTweak, onEdit, disabled }: GenerationCardProps) {
  const settings = item.settings as GenerationSettings | null;

  const formattedTime = new Date(item.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="group rounded-2xl border border-zinc-800 bg-zinc-900/10 p-4 hover:border-violet-500/30 hover:bg-zinc-900/20 shadow-sm hover:shadow-md hover:shadow-violet-950/5 transition-all duration-300 flex flex-col justify-between">
      <div className="space-y-4">
        {/* Render Image or Status Placeholder */}
        <div className="relative rounded-xl bg-zinc-950 border border-zinc-900 aspect-video overflow-hidden">
          {item.status === 'COMPLETED' && item.imageUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.imageUrl}
                alt={item.prompt}
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />
              {/* Download overlay on hover */}
              <div className="absolute inset-0 bg-zinc-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity duration-350">
                <a
                  href={item.imageUrl}
                  download={`generation_${item.id}.png`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-850 text-zinc-200 hover:text-white hover:border-violet-500/40 hover:bg-violet-950/10 transition-all duration-200"
                  title="Download Asset"
                >
                  <Download className="h-4 w-4" />
                </a>
                {onEdit && (
                  <button
                    onClick={() => onEdit(item)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-850 text-zinc-200 hover:text-white hover:border-violet-500/40 hover:bg-violet-950/10 transition-all duration-200 cursor-pointer"
                    title="Edit Overlay"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                )}
              </div>
            </>
          ) : item.status === 'PROCESSING' ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2 bg-zinc-950/50">
              <Loader2 className="h-5 w-5 animate-spin text-violet-400" />
              <span className="text-[10px] text-violet-400 font-semibold font-mono uppercase tracking-wide">Processing...</span>
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2 bg-red-950/20">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="text-[10px] text-red-400 font-semibold font-mono uppercase tracking-wide">Failed</span>
            </div>
          )}
        </div>

        {/* Text Prompt and Details */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-semibold text-zinc-500 font-mono uppercase tracking-wider">{item.model}</span>
            <span className="text-[9px] text-zinc-600 font-mono">{formattedTime}</span>
          </div>
          <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed italic">&ldquo;{item.prompt}&rdquo;</p>
        </div>
      </div>

      {/* Footer Settings & Tweak Action */}
      <div className="border-t border-zinc-850/60 pt-3 mt-3 space-y-2">
        {settings && (
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[9px] text-zinc-500 font-mono">
            <div>AR: <span className="text-zinc-400">{settings.aspectRatio || '1:1'}</span></div>
            <div className="text-right">Steps: <span className="text-zinc-400">{settings.steps || 'N/A'}</span></div>
            <div>Scale: <span className="text-zinc-400">{settings.guidanceScale || 'N/A'}</span></div>
            <div className="text-right">Seed: <span className="text-zinc-400">{settings.seed || '0'}</span></div>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-zinc-850/40 pt-2 mt-2">
          {/* Status Badge */}
          <span className={`inline-flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full ${
            item.status === 'COMPLETED'
              ? 'text-emerald-400 bg-emerald-950/20 border border-emerald-900/30'
              : item.status === 'PROCESSING'
              ? 'text-violet-400 bg-violet-950/20 border border-violet-900/30 animate-pulse'
              : 'text-red-400 bg-red-950/20 border border-red-900/30'
          }`}>
            {item.status === 'COMPLETED' && <Check className="h-2.5 w-2.5" />}
            {item.status === 'PROCESSING' && <Loader2 className="h-2.5 w-2.5 animate-spin" />}
            {item.status === 'FAILED' && <AlertTriangle className="h-2.5 w-2.5" />}
            <span>{item.status}</span>
          </span>

          <div className="flex items-center gap-3">
            {item.status === 'COMPLETED' && onEdit && (
              <button
                onClick={() => onEdit(item)}
                disabled={disabled}
                className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-zinc-300 font-semibold disabled:opacity-50 transition-colors cursor-pointer"
              >
                <span>Edit</span>
              </button>
            )}

            {/* Tweak Button */}
            <button
              onClick={() => onTweak(item)}
              disabled={disabled}
              className="flex items-center gap-1 text-[10px] text-violet-400 hover:text-violet-300 font-bold disabled:opacity-50 transition-colors cursor-pointer"
            >
              <RefreshCcw className="h-3 w-3" />
              <span>Tweak</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
