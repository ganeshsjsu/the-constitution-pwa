'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, BrainCircuit } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AnalysisPage() {
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const runAnalysis = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/analysis', {
                method: 'POST',
            });
            const data = await response.json();
            setAnalysis(data.analysis);
        } catch (error) {
            console.error('Analysis failed:', error);
            setAnalysis("System Error: Unable to compute trajectory.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[100dvh] bg-black text-white p-6 pb-32 font-mono">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <Link href="/history">
                    <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white">
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                </Link>
                <h2 className="text-zinc-500 text-xs font-mono uppercase tracking-widest">Protocol: Oracle</h2>
                <div className="w-10"></div>
            </div>

            <div className="flex flex-col gap-8 max-w-lg mx-auto">
                {/* Introduction */}
                {!analysis && !isLoading && (
                    <div className="flex flex-col items-center text-center gap-6 mt-20">
                        <div className="p-4 bg-zinc-900 rounded-full">
                            <BrainCircuit className="w-12 h-12 text-zinc-500" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">Run Trajectory Diagnostics</h1>
                        <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">
                            The system will analyze your recent decisions to project your future self.
                            <br /><br />
                            <span className="text-red-500">Warning: This process is brutal and honest.</span>
                        </p>

                        <Button
                            onClick={runAnalysis}
                            size="lg"
                            className="bg-white text-black hover:bg-zinc-200 uppercase tracking-widest font-bold mt-4"
                        >
                            Execute Projection
                        </Button>
                    </div>
                )}

                {/* Loading State */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center mt-32 gap-4">
                        <div className="w-16 h-1 bg-zinc-800 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-white"
                                initial={{ x: '-100%' }}
                                animate={{ x: '100%' }}
                                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                            />
                        </div>
                        <p className="text-xs uppercase tracking-widest text-zinc-500 animate-pulse">Analyzing Pattern Data...</p>
                    </div>
                )}

                {/* Result */}
                {analysis && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col gap-6"
                    >
                        <Card className="p-6 bg-zinc-950 border-zinc-800">
                            <h3 className="text-zinc-500 text-xs uppercase tracking-widest mb-4">Projected Trajectory (1 Year)</h3>
                            <div className="prose prose-invert prose-p:text-zinc-300 prose-p:leading-relaxed text-sm">
                                {analysis.split('\n').map((line, i) => (
                                    <p key={i} className="mb-4">{line}</p>
                                ))}
                            </div>
                        </Card>

                        <Button
                            onClick={() => setAnalysis(null)}
                            variant="outline"
                            className="border-zinc-800 text-zinc-500 hover:text-white"
                        >
                            Close Report
                        </Button>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
