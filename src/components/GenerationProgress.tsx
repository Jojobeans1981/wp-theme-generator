'use client';

import { useEffect, useState } from 'react';

const STATUS_MESSAGES = [
  'Analyzing your description...',
  'Designing color system...',
  'Choosing typography...',
  'Building header and navigation...',
  'Creating hero section...',
  'Constructing page templates...',
  'Assembling block patterns...',
  'Styling the footer...',
  'Validating block markup...',
  'Packaging theme files...',
];

export default function GenerationProgress() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % STATUS_MESSAGES.length);
    }, 3000);

    const timeInterval = setInterval(() => {
      setElapsed((t) => t + 1);
    }, 1000);

    return () => {
      clearInterval(msgInterval);
      clearInterval(timeInterval);
    };
  }, []);

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const timeStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-8">
      {/* Spinner */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-zinc-700" />
        <div className="absolute inset-0 rounded-full border-4 border-t-violet-500 animate-spin" />
      </div>

      <div className="text-center space-y-2">
        <p className="text-lg text-zinc-200 font-medium animate-pulse">
          {STATUS_MESSAGES[messageIndex]}
        </p>
        <p className="text-sm text-zinc-500">Elapsed: {timeStr}</p>
      </div>

      <p className="text-xs text-zinc-600 max-w-md text-center">
        Theme generation typically takes 15-45 seconds. The AI is creating
        templates, patterns, and a complete design system for your theme.
      </p>
    </div>
  );
}
