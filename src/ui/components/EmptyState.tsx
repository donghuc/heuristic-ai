import React from 'react';

export function EmptyState() {
    return (
        <div className="flex flex-col flex-1 items-center justify-center px-6 pt-4 pb-0 text-center h-full">

            {/* Illustration */}
            <div className="mb-6">
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                    {/* Frame outline */}
                    <rect x="14" y="10" width="52" height="60" rx="4" stroke="var(--figma-color-border,#444)" strokeWidth="2" />
                    {/* Frame inner guides */}
                    <rect x="22" y="20" width="36" height="8" rx="2" fill="var(--figma-color-border,#444)" opacity="0.5" />
                    <rect x="22" y="34" width="22" height="6" rx="2" fill="var(--figma-color-border,#444)" opacity="0.35" />
                    <rect x="22" y="46" width="28" height="6" rx="2" fill="var(--figma-color-border,#444)" opacity="0.25" />
                    {/* Cursor arrow */}
                    <g transform="translate(44, 48)">
                        <path d="M0 0 L0 16 L4 12 L7 18 L9 17 L6 11 L11 11 Z"
                            fill="var(--figma-color-bg-brand,#18A0FB)" stroke="var(--figma-color-bg,#2C2C2C)" strokeWidth="1.5" strokeLinejoin="round" />
                    </g>
                    {/* Dashed selection border */}
                    <rect x="14" y="10" width="52" height="60" rx="4"
                        stroke="var(--figma-color-bg-brand,#18A0FB)" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.4" />
                </svg>
            </div>

            <h2 className="text-[15px] font-semibold text-figma-text mb-2">
                Select a frame
            </h2>
            <p className="text-[13px] text-figma-textMuted leading-relaxed max-w-[220px]">
                Click on any frame on the canvas, then press <span className="text-figma-text font-medium">Run Audit</span> to begin.
            </p>
        </div>
    );
}
