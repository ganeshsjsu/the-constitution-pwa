import { getWinRate } from '@/lib/actions';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const winRate = await getWinRate();

  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center p-6 relative bg-black text-white selection:bg-white selection:text-black">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl opacity-20 animate-pulse"></div>
      </div>

      <div className="z-10 flex flex-col items-center gap-12 w-full max-w-sm">

        {/* Header / Status */}
        <div className="flex flex-col items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-zinc-500 uppercase tracking-[0.2em] text-xs font-semibold">
            System Identity
          </h1>
          <p className="font-mono text-zinc-400 text-sm">Disciplined Builder</p>
        </div>

        {/* Win Rate Display */}
        <div className="flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
          <div className="relative">
            <span className="text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-600 drop-shadow-2xl">
              {winRate}
            </span>
            <span className="absolute top-4 -right-6 text-2xl text-zinc-500 font-bold">%</span>
          </div>
          <p className="text-zinc-500 uppercase tracking-widest text-sm">Win Rate</p>
        </div>

        {/* Action Button */}
        <div className="w-full pt-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
          <Link href="/spar" className="w-full block">
            <Button
              size="lg"
              className="w-full h-20 text-2xl bg-white text-black hover:bg-zinc-200 active:scale-95 transition-all duration-200 uppercase font-black tracking-widest shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] rounded-2xl border-none ring-0"
            >
              Spar
            </Button>
          </Link>
          <p className="text-center text-zinc-600 text-xs mt-4 font-mono">
            Intervention Required?
          </p>
        </div>

      </div>
    </main>
  );
}
