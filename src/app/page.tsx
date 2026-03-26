'use client';

import { useState } from 'react';
import ThemeForm from '@/components/ThemeForm';
import GenerationProgress from '@/components/GenerationProgress';
import ThemePreview from '@/components/ThemePreview';
import type { ThemeRequest } from '@/lib/types';

type AppState =
  | { phase: 'input' }
  | { phase: 'generating'; request: ThemeRequest }
  | { phase: 'result'; request: ThemeRequest; zipBlob: Blob }
  | { phase: 'error'; request: ThemeRequest; message: string };

export default function Home() {
  const [state, setState] = useState<AppState>({ phase: 'input' });

  async function handleSubmit(request: ThemeRequest) {
    setState({ phase: 'generating', request });

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        let message = 'Theme generation failed. Please try again.';
        try {
          const err = await response.json();
          if (err.error) message = err.error;
        } catch {
          // ignore parse error
        }
        setState({ phase: 'error', request, message });
        return;
      }

      const blob = await response.blob();
      setState({ phase: 'result', request, zipBlob: blob });
    } catch {
      setState({
        phase: 'error',
        request,
        message:
          'Failed to connect to the server. Please check your connection and try again.',
      });
    }
  }

  function handleReset() {
    setState({ phase: 'input' });
  }

  const slug =
    state.phase !== 'input'
      ? state.request.slug ||
        state.request.themeName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
      : '';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-zinc-100">Word-Press-O-Matic</h1>
            <p className="text-xs text-zinc-500">
              AI-powered WordPress Block Theme builder
            </p>
          </div>
          <span className="text-xs text-zinc-600 font-mono">FSE / Block Themes</span>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 px-6 py-10">
        <div className="max-w-3xl mx-auto">
          {state.phase === 'input' && (
            <div>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-zinc-100 mb-2">
                  Create Your WordPress Theme
                </h2>
                <p className="text-zinc-400">
                  Describe your ideal website and our AI will generate a complete,
                  installable WordPress Block Theme with custom colors, typography,
                  templates, and patterns.
                </p>
              </div>
              <ThemeForm onSubmit={handleSubmit} disabled={false} />
            </div>
          )}

          {state.phase === 'generating' && <GenerationProgress />}

          {state.phase === 'result' && (
            <ThemePreview
              themeName={state.request.themeName}
              description={state.request.description}
              slug={slug}
              zipBlob={state.zipBlob}
              onReset={handleReset}
            />
          )}

          {state.phase === 'error' && (
            <div className="space-y-6">
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                <p className="text-red-300 font-medium mb-1">Generation Failed</p>
                <p className="text-red-400/80 text-sm">{state.message}</p>
              </div>
              <button
                onClick={handleReset}
                className="px-6 py-3 rounded-lg font-medium text-zinc-300 border border-zinc-700 hover:border-zinc-500 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 px-6 py-4">
        <div className="max-w-3xl mx-auto text-center text-xs text-zinc-600">
          Generates WordPress 6.4+ compatible Block Themes using only native blocks.
        </div>
      </footer>
    </div>
  );
}
