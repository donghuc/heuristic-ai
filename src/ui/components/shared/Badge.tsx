import React from 'react';

interface Props {
    severity: 'Critical' | 'High' | 'Medium' | 'Low' | string;
}

const SEVERITY_STYLES: Record<string, { pill: string; dot: string }> = {
    Critical: {
        pill: 'bg-red-500/15 text-red-400 border-red-500/30',
        dot: 'bg-red-500',
    },
    High: {
        pill: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
        dot: 'bg-orange-500',
    },
    Medium: {
        pill: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
        dot: 'bg-yellow-500',
    },
    Low: {
        pill: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
        dot: 'bg-zinc-500',
    },
};

export function Badge({ severity }: Props) {
    const styles = SEVERITY_STYLES[severity] ?? SEVERITY_STYLES.Low;

    return (
        <span
            className={`inline-flex items-center gap-1 text-[10px] uppercase font-bold
                        px-2 py-0.5 rounded-full border shrink-0 leading-none ${styles.pill}`}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
            {severity}
        </span>
    );
}
