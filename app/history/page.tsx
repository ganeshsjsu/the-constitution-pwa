import { LocalTime } from '@/components/local-time';
import { getHistory } from '@/lib/actions';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function HistoryPage() {
    const history = await getHistory();

    return (
        <div className="min-h-[100dvh] bg-black text-white p-6 pb-32">
            {/* ... (Header code remains) ... */}

            <div className="flex items-center justify-between mb-8">
                <Link href="/">
                    <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white">
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                </Link>
                <Link href="/history/analysis">
                    <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-white font-mono text-xs uppercase">
                        Diagnostics
                    </Button>
                </Link>
            </div>

            {/* List */}
            <div className="flex flex-col gap-4 max-w-lg mx-auto">
                {history.length === 0 && (
                    <p className="text-center text-zinc-700 font-mono text-sm mt-20">No data recorded.</p>
                )}

                {history.map((item) => {
                    const isWin = item.outcome === 'executed';
                    const category = item.meta?.category || 'UNCATEGORIZED';

                    // Color mapping for tags
                    const tagColors: Record<string, string> = {
                        PHYSICAL: 'text-rose-400 bg-rose-950/30 border-rose-900/50',
                        CAREER: 'text-blue-400 bg-blue-950/30 border-blue-900/50',
                        TALENT: 'text-amber-400 bg-amber-950/30 border-amber-900/50',
                        SOCIAL: 'text-purple-400 bg-purple-950/30 border-purple-900/50',
                        UNCATEGORIZED: 'text-zinc-500 bg-zinc-900 border-zinc-800'
                    };

                    const tagClass = tagColors[category] || tagColors['UNCATEGORIZED'];

                    return (
                        <Card
                            key={item.id}
                            className={`p-4 bg-zinc-900 border-zinc-800 ${isWin ? 'border-l-emerald-500/50' : 'border-l-red-500/50'
                                } border-l-4`}
                        >
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${tagClass}`}>
                                            {category}
                                        </span>
                                    </div>
                                    <p className="text-zinc-300 font-medium text-lg leading-snug">{item.dilemma}</p>
                                    <p className="text-zinc-600 text-xs font-mono mt-2 uppercase">
                                        <LocalTime date={item.created_at} />
                                    </p>
                                </div>
                                <div className={`mt-1 ${isWin ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {isWin ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
