'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, FileCode } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CodeViewerProps {
  code: string;
  language?: string;
  filename?: string;
  className?: string;
}

const LANG_BADGE: Record<string, string> = {
  dockerfile: 'bg-blue-900/60 text-blue-300',
  yaml: 'bg-amber-900/60 text-amber-300',
  markdown: 'bg-indigo-900/60 text-indigo-300',
  terraform: 'bg-violet-900/60 text-violet-300',
  json: 'bg-slate-700 text-slate-300',
  text: 'bg-slate-700 text-slate-300',
};

export default function CodeViewer({ code, language = 'text', filename, className }: CodeViewerProps) {
  const [copied, setCopied] = useState(false);
  const lines = code.split('\n');

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  return (
    <div className={cn('code-editor', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
          </div>
          {filename && (
            <div className="flex items-center gap-1.5 ml-2">
              <FileCode className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs text-slate-400 font-mono">{filename}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={cn('text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded', LANG_BADGE[language] || LANG_BADGE.text)}>
            {language}
          </span>
          <motion.button
            onClick={handleCopy}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            title="Copy to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </motion.button>
        </div>
      </div>

      {/* Code */}
      <div className="overflow-auto max-h-[600px]">
        <div className="flex min-w-0">
          {/* Line numbers */}
          <div className="select-none py-4 px-3 text-right bg-slate-900/40 border-r border-slate-800 flex-shrink-0">
            {lines.map((_, i) => (
              <div key={i} className="text-xs text-slate-600 leading-6 font-mono tabular-nums">
                {i + 1}
              </div>
            ))}
          </div>
          {/* Code content */}
          <pre className="flex-1 py-4 px-4 text-sm font-mono leading-6 text-slate-300 overflow-x-auto">
            {lines.map((line, i) => (
              <div key={i} className="whitespace-pre hover:bg-slate-800/30 transition-colors px-1 -mx-1 rounded">
                {line || ' '}
              </div>
            ))}
          </pre>
        </div>
      </div>
    </div>
  );
}