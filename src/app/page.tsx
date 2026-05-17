import { Container } from "@/components/Container";
import { Sparkles, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-20 lg:py-32">
      <Container className="flex flex-col items-center text-center">
        {/* Minimal Centered Placeholder Section */}
        <div className="max-w-3xl space-y-6">
          {/* Subtle Tag/Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-3.5 py-1.5 text-xs text-zinc-400">
            <Sparkles className="h-3.5 w-3.5 text-violet-400" />
            <span>Next-gen Creative Engine</span>
          </div>

          {/* Simple Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-100">
            Design beautiful generative media with{" "}
            <span className="text-violet-400">AI</span>
          </h1>

          {/* Small Subtitle */}
          <p className="max-w-xl mx-auto text-base sm:text-lg text-zinc-400 leading-relaxed">
            Create high-fidelity images, cinematic videos, and dynamic digital assets from a single prompt interface.
          </p>

          {/* Placeholder Box for Future Prompt Input */}
          <div className="pt-8 max-w-xl mx-auto w-full">
            <div className="relative flex items-center rounded-xl bg-zinc-900 border border-zinc-800 p-2 shadow-2xl shadow-black/80 transition-all duration-200">
              <input
                type="text"
                disabled
                placeholder="Describe your creative vision... (e.g. 'cinematic neon city')"
                className="w-full bg-transparent px-4 py-3 text-sm text-zinc-300 placeholder-zinc-500 outline-none cursor-not-allowed select-none"
              />
              <button
                disabled
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-850 text-zinc-500 cursor-not-allowed"
                title="Prompting disabled in preview"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3 flex items-center justify-between px-2 text-xs text-zinc-500">
              <span>Future prompt input</span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse" />
                Under Construction
              </span>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
