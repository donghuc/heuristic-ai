import React from 'react';

interface Props {
    score: number;
}

// SVG arc gauge — center (36,36), radius 28, strokeWidth 6
const cx = 36, cy = 36, r = 28;
const circumference = 2 * Math.PI * r;
// We use a 270° arc (¾ circle), starting from bottom-left (-135°)
const ARC_RATIO = 0.75;
const arcLen = circumference * ARC_RATIO;

function getArcOffset(score: number) {
    const pct = Math.min(Math.max(score, 0), 100) / 100;
    return arcLen - pct * arcLen;
}

function getColor(score: number): string {
    if (score >= 80) return '#1BC47D'; // success green
    if (score >= 50) return '#FFCD29'; // warning yellow
    return '#EF4444';                  // critical red
}

export function ScoreCard({ score }: Props) {
    const label = score >= 80 ? 'Excellent' : score >= 50 ? 'Needs work' : 'Critical';
    const color = getColor(score);
    const offset = getArcOffset(score);

    // Rotation: arc starts at 135° (lower-left) and sweeps 270°
    const rotation = 135;

    return (
        <div className="flex items-center gap-5 bg-figma-bgSecondary border border-figma-border rounded-lg px-4 py-4 mb-5">

            {/* Arc gauge */}
            <div className="relative flex-shrink-0" style={{ width: 72, height: 72 }}>
                <svg width="72" height="72" viewBox="0 0 72 72">
                    {/* Track arc */}
                    <circle
                        cx={cx} cy={cy} r={r}
                        fill="none"
                        stroke="var(--figma-color-border,#444)"
                        strokeWidth="6"
                        strokeDasharray={`${arcLen} ${circumference}`}
                        strokeDashoffset="0"
                        strokeLinecap="round"
                        transform={`rotate(${rotation} ${cx} ${cy})`}
                    />
                    {/* Progress arc */}
                    <circle
                        cx={cx} cy={cy} r={r}
                        fill="none"
                        stroke={color}
                        strokeWidth="6"
                        strokeDasharray={`${arcLen} ${circumference}`}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        transform={`rotate(${rotation} ${cx} ${cy})`}
                        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                    />
                </svg>

                {/* Score numeral centered inside */}
                <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ paddingBottom: 4 }}>
                    <span className="text-[22px] font-extrabold leading-none" style={{ color }}>
                        {score}
                    </span>
                </div>
            </div>

            {/* Label column */}
            <div>
                <p className="text-[11px] uppercase tracking-widest text-figma-textMuted font-semibold mb-0.5">
                    Usability Score
                </p>
                <h3 className="text-[15px] font-bold text-figma-text leading-tight">
                    {label}
                </h3>
                <p className="text-[11px] text-figma-textMuted mt-1 leading-snug">
                    {score >= 80
                        ? 'Great design — minor polish only'
                        : score >= 50
                            ? 'Several UX issues to address'
                            : 'Significant heuristic violations found'}
                </p>
            </div>
        </div>
    );
}
