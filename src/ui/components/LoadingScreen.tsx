import React, { useEffect, useState } from 'react';

interface Props {
    statusText?: string;
    subText?: string;
}

interface Step {
    id: number;
    label: string;
    detail: string;
}

const STEPS: Step[] = [
    { id: 0, label: 'Extracting nodes', detail: 'Reading layers, text, and component tree' },
    { id: 1, label: 'Running checks', detail: 'Contrast, spacing, and heuristic rules' },
    { id: 2, label: 'AI analyzing', detail: 'LLM evaluating patterns and recommendations' },
];

// Auto-advance timings (ms). Step 2 stays active until AUDIT_COMPLETE unmounts this screen.
const STEP_DURATIONS = [1200, 2200];

export function LoadingScreen({ statusText, subText }: Props) {
    const [activeStep, setActiveStep] = useState(0);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;

        if (activeStep < STEP_DURATIONS.length) {
            timer = setTimeout(() => {
                setActiveStep(s => s + 1);
            }, STEP_DURATIONS[activeStep]);
        }

        return () => clearTimeout(timer);
    }, [activeStep]);

    const currentStep = STEPS[activeStep] ?? STEPS[STEPS.length - 1];

    return (
        <div className="flex flex-col flex-1 items-center justify-center px-6 h-full">

            {/* Stepper */}
            <div className="flex flex-col items-start gap-0 mb-8">
                {STEPS.map((step, idx) => {
                    const isDone = idx < activeStep;
                    const isActive = idx === activeStep;
                    const isPending = idx > activeStep;

                    return (
                        <React.Fragment key={step.id}>
                            {/* Step row */}
                            <div className="flex items-center gap-3">
                                {/* Circle */}
                                <div className="relative flex-shrink-0 w-8 h-8 flex items-center justify-center">
                                    {isActive && (
                                        <div className="absolute inset-0 rounded-full bg-figma-blue/20 animate-ping" />
                                    )}
                                    <div className={[
                                        'w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300',
                                        isDone ? 'border-figma-blue bg-figma-blue' : '',
                                        isActive ? 'border-figma-blue bg-figma-bg' : '',
                                        isPending ? 'border-figma-border bg-figma-bg' : '',
                                    ].join(' ')}>
                                        {isDone && (
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        )}
                                        {isActive && (
                                            <div className="w-2.5 h-2.5 rounded-full bg-figma-blue animate-pulse" />
                                        )}
                                        {isPending && (
                                            <div className="w-2 h-2 rounded-full bg-figma-border" />
                                        )}
                                    </div>
                                </div>

                                {/* Label */}
                                <div className="flex flex-col">
                                    <span className={[
                                        'text-[13px] font-medium transition-colors duration-300',
                                        isDone ? 'text-figma-blue line-through opacity-60' : '',
                                        isActive ? 'text-figma-text' : '',
                                        isPending ? 'text-figma-textMuted' : '',
                                    ].join(' ')}>
                                        {step.label}
                                    </span>
                                </div>
                            </div>

                            {/* Connector line (not after last) */}
                            {idx < STEPS.length - 1 && (
                                <div className="w-8 flex justify-center">
                                    <div className={[
                                        'w-px h-6 transition-colors duration-500',
                                        idx < activeStep
                                            ? 'bg-figma-blue'
                                            : 'bg-figma-border',
                                    ].join(' ')} />
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            {/* Dynamic sub-text — uses prop overrides if provided, else step detail */}
            <div className="text-center">
                <p className="text-[13px] font-medium text-figma-text mb-1">
                    {statusText ?? currentStep.label}
                </p>
                <p className="text-[11px] text-figma-textMuted max-w-[200px] leading-relaxed">
                    {subText ?? currentStep.detail}
                </p>
            </div>
        </div>
    );
}
