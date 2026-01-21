'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowUp, X } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { saveDecision } from '@/lib/actions';
import { useRouter } from 'next/navigation';

type Message = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
};

export default function SparPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [outcome, setOutcome] = useState<'pending' | 'folded' | 'executed'>('pending');
    const scrollRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    const handleFormSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        // Add user message
        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: [...messages, userMsg] }),
            });

            if (!response.body) throw new Error('No response body');

            // Create placeholder AI message
            const aiMsgId = (Date.now() + 1).toString();
            let aiContent = '';

            setMessages(prev => [...prev, { id: aiMsgId, role: 'assistant', content: '' }]);

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                aiContent += chunk;

                setMessages(prev => prev.map(m =>
                    m.id === aiMsgId ? { ...m, content: aiContent } : m
                ));
            }
        } catch (error) {
            console.error('Stream error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDecision = async (result: 'folded' | 'executed') => {
        setOutcome(result);
        const dilemma = messages.filter(m => m.role === 'user').pop()?.content || 'Unknown Dilemma';

        try {
            await saveDecision(dilemma, result);
        } catch (err) {
            console.error('Error saving decision:', err);
        } finally {
            // Always redirect, even if save failed
            setTimeout(() => router.push('/'), 1500);
        }
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const lastMessage = messages[messages.length - 1];
    const isAI = lastMessage?.role === 'assistant';

    return (
        <div className="flex flex-col h-[100dvh] bg-black text-white relative">
            {/* Header */}
            <div className="flex items-center justify-between p-6 z-10">
                <h2 className="text-zinc-500 text-xs font-mono uppercase tracking-widest">Protocol: Spar</h2>
                <Link href="/">
                    <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white hover:bg-white/10 rounded-full">
                        <X className="w-6 h-6" />
                    </Button>
                </Link>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto px-6 pb-32" ref={scrollRef}>
                <div className="flex flex-col gap-8 max-w-lg mx-auto pt-10">
                    {messages.length === 0 && (
                        <div className="text-center mt-20 opacity-50">
                            <p className="text-zinc-600 text-sm font-mono">Present your dilemma.</p>
                        </div>
                    )}

                    {messages.map((m) => (
                        <motion.div
                            key={m.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex flex-col gap-1 ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                        >
                            <div className={`max-w-[85%] rounded-2xl px-5 py-3 text-lg font-medium leading-relaxed
                ${m.role === 'user'
                                    ? 'bg-zinc-900 text-zinc-300 rounded-tr-sm'
                                    : 'bg-white text-black rounded-tl-sm shadow-[0_0_30px_-10px_rgba(255,255,255,0.2)]'
                                }`}
                            >
                                {m.content}
                            </div>
                            <span className="text-[10px] text-zinc-700 font-mono uppercase">
                                {m.role === 'user' ? 'You' : 'Constitution'}
                            </span>
                        </motion.div>
                    ))}

                    {isLoading && !isAI && ( // Show loader only if AI hasn't started streaming
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-zinc-600">
                            <div className="w-2 h-2 bg-zinc-600 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-zinc-600 rounded-full animate-bounce delay-75"></div>
                            <div className="w-2 h-2 bg-zinc-600 rounded-full animate-bounce delay-150"></div>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Input / Action Area */}
            <div className="fixed bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black via-black pt-20">
                <div className="max-w-lg mx-auto w-full">

                    <AnimatePresence mode="wait">
                        {isAI && outcome === 'pending' && !isLoading ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="grid grid-cols-2 gap-3 mb-4"
                            >
                                <Button
                                    onClick={() => handleDecision('folded')}
                                    className="h-16 text-xl font-bold bg-red-950/30 text-red-500 hover:bg-red-900/50 hover:text-red-400 border border-red-900/50 rounded-xl uppercase tracking-wider"
                                >
                                    I Folded
                                </Button>
                                <Button
                                    onClick={() => handleDecision('executed')}
                                    className="h-16 text-xl font-bold bg-emerald-950/30 text-emerald-500 hover:bg-emerald-900/50 hover:text-emerald-400 border border-emerald-900/50 rounded-xl uppercase tracking-wider"
                                >
                                    I Executed
                                </Button>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleFormSubmit} className="relative flex items-center gap-2 w-full">
                                <Input
                                    value={input}
                                    onChange={handleInputChange}
                                    placeholder="Type or speak..."
                                    className="h-14 bg-zinc-900/50 border-zinc-800 text-lg rounded-full px-6 focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-all font-medium placeholder:text-zinc-700"
                                    autoFocus
                                    disabled={outcome !== 'pending' || isLoading}
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    disabled={!input.trim() || isLoading}
                                    className="absolute right-2 h-10 w-10 rounded-full bg-white text-black hover:bg-zinc-300 disabled:opacity-50"
                                >
                                    <ArrowUp className="w-5 h-5" />
                                </Button>
                            </form>
                        )}
                    </AnimatePresence>

                    {outcome !== 'pending' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center mt-4 text-zinc-500 font-mono text-xs uppercase"
                        >
                            Result Recorded: {outcome}
                        </motion.div>
                    )}

                </div>
            </div>
        </div>
    );
}
