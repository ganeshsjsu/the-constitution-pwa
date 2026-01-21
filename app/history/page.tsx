import { getHistory } from '@/lib/actions';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function HistoryPage() {
    const history = await getHistory();

    // Group by Date (simple version)
    // We can just list them for now to keep it raw/brutalist

    return (
        <div className="min-h-[100dvh] bg-black text-white p-6 pb-32">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <Link href="/">
                    <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white">
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                </Link>
                <h2 className="text-zinc-500 text-xs font-mono uppercase tracking-widest">The Ledger</h2>
                <div className="w-10"></div> {/* Spacer for alignment */}
            </div>

            {/* List */}
            <div className="flex flex-col gap-4 max-w-lg mx-auto">
                {history.length === 0 && (
                    <p className="text-center text-zinc-700 font-mono text-sm mt-20">No data recorded.</p>
                )}

                {history.map((item) => {
                    const isWin = item.outcome === 'executed';
                    const date = new Date(item.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                    });

                    return (
                        <Card
                            key={item.id}
                            className={`p-4 bg-zinc-900 border-zinc-800 ${isWin ? 'border-l-emerald-500/50' : 'border-l-red-500/50'
                                } border-l-4`}
                        >
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                    <p className="text-zinc-300 font-medium text-lg leading-snug">{item.dilemma}</p>
                                    <p className="text-zinc-600 text-xs font-mono mt-2 uppercase">{date}</p>
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
