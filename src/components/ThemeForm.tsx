'use client';

import { useState } from 'react';
import type { ThemeRequest, ColorPalette, ThemeFeature } from '@/lib/types';

const GOOGLE_FONTS = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins',
  'Raleway', 'Oswald', 'Playfair Display', 'Merriweather', 'Source Sans 3',
  'Nunito', 'Ubuntu', 'Rubik', 'Work Sans', 'DM Sans', 'Space Grotesk',
  'Outfit', 'Bitter', 'Crimson Text',
];

const PRESETS: Array<{ label: string; data: ThemeRequest }> = [
  {
    label: 'Dark Photography Portfolio',
    data: {
      themeName: 'Obsidian Lens',
      description:
        'A dramatic dark-mode photography portfolio with a fullscreen hero, immersive gallery grid, sticky minimal navigation, and elegant serif typography. Optimized for visual storytelling with large images and subtle animations.',
      colorPalette: {
        primary: '#E8C547',
        secondary: '#2A2A2A',
        accent: '#C9A84C',
        background: '#0D0D0D',
        foreground: '#F5F5F5',
      },
      typography: { headingFont: 'Playfair Display', bodyFont: 'Inter' },
      features: ['portfolio'],
    },
  },
  {
    label: 'Clean Business Landing',
    data: {
      themeName: 'Apex Business',
      description:
        'A professional, conversion-focused business landing page with a bold hero section, feature grid with icons, testimonial carousel, pricing comparison columns, and a strong call-to-action footer. Clean lines and confident typography.',
      colorPalette: {
        primary: '#1E40AF',
        secondary: '#1E293B',
        accent: '#F59E0B',
        background: '#FFFFFF',
        foreground: '#0F172A',
      },
      typography: { headingFont: 'Space Grotesk', bodyFont: 'DM Sans' },
      features: ['landing'],
    },
  },
  {
    label: 'Colorful Food Blog',
    data: {
      themeName: 'Saffron Kitchen',
      description:
        'A warm, inviting food blog with a full-width hero featuring an overlay, recipe card grid layout, hand-crafted feel with rounded corners and playful typography. Categories for cuisines, cooking tips, and seasonal favorites.',
      colorPalette: {
        primary: '#D97706',
        secondary: '#7C2D12',
        accent: '#059669',
        background: '#FFFBEB',
        foreground: '#1C1917',
      },
      typography: { headingFont: 'Bitter', bodyFont: 'Nunito' },
      features: ['blog'],
    },
  },
  {
    label: 'Minimal Tech Docs',
    data: {
      themeName: 'Syntax Docs',
      description:
        'A minimal, developer-friendly documentation theme with sidebar navigation, code-block styling, a clean hierarchy, search-focused header, and a monospace-accented design system. Inspired by modern API documentation sites.',
      colorPalette: {
        primary: '#6D28D9',
        secondary: '#4338CA',
        accent: '#10B981',
        background: '#FAFAFA',
        foreground: '#18181B',
      },
      typography: { headingFont: 'Space Grotesk', bodyFont: 'Inter' },
      features: ['documentation'],
    },
  },
];

const ALL_FEATURES: ThemeFeature[] = [
  'blog',
  'portfolio',
  'ecommerce',
  'landing',
  'documentation',
];

interface ThemeFormProps {
  onSubmit: (request: ThemeRequest) => void;
  disabled: boolean;
}

export default function ThemeForm({ onSubmit, disabled }: ThemeFormProps) {
  const [themeName, setThemeName] = useState('');
  const [description, setDescription] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [colors, setColors] = useState<ColorPalette>({
    primary: '#6D28D9',
    secondary: '#4338CA',
    accent: '#F59E0B',
    background: '#FFFFFF',
    foreground: '#18181B',
  });
  const [useCustomColors, setUseCustomColors] = useState(false);
  const [headingFont, setHeadingFont] = useState('');
  const [bodyFont, setBodyFont] = useState('');
  const [features, setFeatures] = useState<ThemeFeature[]>([]);

  const isValid = themeName.length >= 2 && description.length >= 20;

  function applyPreset(preset: ThemeRequest) {
    setThemeName(preset.themeName);
    setDescription(preset.description);
    if (preset.colorPalette) {
      setColors(preset.colorPalette);
      setUseCustomColors(true);
    }
    if (preset.typography) {
      setHeadingFont(preset.typography.headingFont);
      setBodyFont(preset.typography.bodyFont);
    }
    if (preset.features) {
      setFeatures(preset.features);
    }
    setShowAdvanced(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    const request: ThemeRequest = {
      themeName,
      description,
    };

    if (useCustomColors) {
      request.colorPalette = colors;
    }
    if (headingFont && bodyFont) {
      request.typography = { headingFont, bodyFont };
    }
    if (features.length > 0) {
      request.features = features;
    }

    onSubmit(request);
  }

  function toggleFeature(f: ThemeFeature) {
    setFeatures((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Quick start presets */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Quick Start Presets
        </label>
        <div className="grid grid-cols-2 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => applyPreset(p.data)}
              disabled={disabled}
              className="text-left px-3 py-2 rounded-lg border border-zinc-700 bg-zinc-800/50 text-sm text-zinc-300 hover:border-violet-500 hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Theme Name */}
      <div>
        <label htmlFor="themeName" className="block text-sm font-medium text-zinc-300 mb-1">
          Theme Name <span className="text-red-400">*</span>
        </label>
        <input
          id="themeName"
          type="text"
          value={themeName}
          onChange={(e) => setThemeName(e.target.value)}
          disabled={disabled}
          placeholder="My Awesome Theme"
          maxLength={50}
          className="w-full px-3 py-2 rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-100 placeholder-zinc-500 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none disabled:opacity-50"
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-zinc-300 mb-1">
          Description <span className="text-red-400">*</span>
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={disabled}
          placeholder="A dark mode photography portfolio with sticky nav, large hero, masonry gallery, and minimal footer..."
          rows={4}
          maxLength={1000}
          className="w-full px-3 py-2 rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-100 placeholder-zinc-500 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none resize-none disabled:opacity-50"
        />
        <p className="text-xs text-zinc-500 mt-1">
          {description.length}/1000 characters (min 20)
        </p>
      </div>

      {/* Advanced Options Toggle */}
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
      >
        {showAdvanced ? 'Hide' : 'Show'} Advanced Options
      </button>

      {showAdvanced && (
        <div className="space-y-6 border border-zinc-700/50 rounded-lg p-4 bg-zinc-900/50">
          {/* Color Palette */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-zinc-300 mb-3">
              <input
                type="checkbox"
                checked={useCustomColors}
                onChange={(e) => setUseCustomColors(e.target.checked)}
                disabled={disabled}
                className="accent-violet-500"
              />
              Custom Color Palette
            </label>
            {useCustomColors && (
              <div className="grid grid-cols-5 gap-3">
                {(Object.keys(colors) as Array<keyof ColorPalette>).map((key) => (
                  <div key={key}>
                    <label className="block text-xs text-zinc-400 mb-1 capitalize">
                      {key}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={colors[key]}
                        onChange={(e) =>
                          setColors((prev) => ({ ...prev, [key]: e.target.value }))
                        }
                        disabled={disabled}
                        className="w-8 h-8 rounded cursor-pointer border border-zinc-600"
                      />
                      <span className="text-xs text-zinc-500 font-mono">
                        {colors[key]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Typography */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Typography</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Heading Font</label>
                <select
                  value={headingFont}
                  onChange={(e) => setHeadingFont(e.target.value)}
                  disabled={disabled}
                  className="w-full px-2 py-1.5 rounded border border-zinc-700 bg-zinc-900 text-zinc-100 text-sm outline-none focus:border-violet-500"
                >
                  <option value="">Auto-select</option>
                  {GOOGLE_FONTS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Body Font</label>
                <select
                  value={bodyFont}
                  onChange={(e) => setBodyFont(e.target.value)}
                  disabled={disabled}
                  className="w-full px-2 py-1.5 rounded border border-zinc-700 bg-zinc-900 text-zinc-100 text-sm outline-none focus:border-violet-500"
                >
                  <option value="">Auto-select</option>
                  {GOOGLE_FONTS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Site Type / Features
            </label>
            <div className="flex flex-wrap gap-2">
              {ALL_FEATURES.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => toggleFeature(f)}
                  disabled={disabled}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    features.includes(f)
                      ? 'border-violet-500 bg-violet-500/20 text-violet-300'
                      : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
                  } disabled:opacity-50`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={!isValid || disabled}
        className="w-full py-3 rounded-lg font-semibold text-white bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed transition-colors"
      >
        Generate Theme
      </button>
    </form>
  );
}
