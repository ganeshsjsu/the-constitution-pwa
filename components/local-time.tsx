'use client';

import { useEffect, useState } from 'react';

export function LocalTime({ date }: { date: string | Date }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <span className="opacity-50 text-[10px]">...</span>;
    }

    return (
        <span>
            {new Date(date).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
            })}
        </span>
    );
}
