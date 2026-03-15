'use client';

import { useState } from 'react';

interface ThemePreviewProps {
  themeName: string;
  description: string;
  slug: string;
  zipBlob: Blob;
  onReset: () => void;
}

interface FileEntry {
  name: string;
  children?: FileEntry[];
}

function buildFileTree(slug: string): FileEntry {
  return {
    name: slug,
    children: [
      { name: 'style.css' },
      { name: 'functions.php' },
      { name: 'theme.json' },
      {
        name: 'templates/',
        children: [
          { name: 'index.html' },
          { name: 'single.html' },
          { name: 'page.html' },
          { name: 'archive.html' },
          { name: '404.html' },
          { name: 'search.html' },
        ],
      },
      {
        name: 'parts/',
        children: [{ name: 'header.html' }, { name: 'footer.html' }],
      },
      {
        name: 'patterns/',
        children: [{ name: '*.php (3+ patterns)' }],
      },
    ],
  };
}

function FileTreeNode({ entry, depth = 0 }: { entry: FileEntry; depth?: number }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = entry.children && entry.children.length > 0;

  return (
    <div style={{ paddingLeft: `${depth * 16}px` }}>
      <button
        type="button"
        onClick={() => hasChildren && setExpanded(!expanded)}
        className={`flex items-center gap-1 text-sm py-0.5 ${
          hasChildren ? 'text-zinc-300 cursor-pointer' : 'text-zinc-500 cursor-default'
        }`}
      >
        {hasChildren && (
          <span className="text-xs text-zinc-600">{expanded ? '\u25BC' : '\u25B6'}</span>
        )}
        {!hasChildren && <span className="text-xs text-zinc-700 ml-3">-</span>}
        <span>{entry.name}</span>
      </button>
      {expanded &&
        entry.children?.map((child) => (
          <FileTreeNode key={child.name} entry={child} depth={depth + 1} />
        ))}
    </div>
  );
}

export default function ThemePreview({
  themeName,
  description,
  slug,
  zipBlob,
  onReset,
}: ThemePreviewProps) {
  function handleDownload() {
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slug}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const fileTree = buildFileTree(slug);
  const sizeMB = (zipBlob.size / 1024).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Success banner */}
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-4 py-3 flex items-center gap-3">
        <span className="text-emerald-400 text-xl">&#10003;</span>
        <div>
          <p className="text-emerald-300 font-medium">Theme generated successfully!</p>
          <p className="text-emerald-400/70 text-sm">
            {sizeMB} KB &middot; Ready for WordPress 6.4+
          </p>
        </div>
      </div>

      {/* Theme info */}
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-zinc-100">{themeName}</h2>
        <p className="text-sm text-zinc-400">{description}</p>
      </div>

      {/* File tree */}
      <div className="border border-zinc-700/50 rounded-lg p-4 bg-zinc-900/50">
        <h3 className="text-sm font-medium text-zinc-300 mb-3">Generated Files</h3>
        <FileTreeNode entry={fileTree} />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleDownload}
          className="flex-1 py-3 rounded-lg font-semibold text-white bg-violet-600 hover:bg-violet-500 transition-colors"
        >
          Download Theme (.zip)
        </button>
        <button
          onClick={onReset}
          className="px-6 py-3 rounded-lg font-medium text-zinc-300 border border-zinc-700 hover:border-zinc-500 transition-colors"
        >
          Generate Another
        </button>
      </div>
    </div>
  );
}
