'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Folder, FileCode, ChevronRight, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { TreeNode } from '@/types';

const LANG_ICONS: Record<string, string> = {
  docker: 'D', yaml: 'Y', yml: 'Y', json: 'J', md: 'M', ts: 'T', js: 'J', py: 'P',
  java: 'J', go: 'G', rs: 'R', tf: 'T',
};
const LANG_COLORS: Record<string, string> = {
  docker: 'bg-blue-100 text-blue-700', yaml: 'bg-amber-100 text-amber-700',
  yml: 'bg-amber-100 text-amber-700', json: 'bg-slate-100 text-slate-700',
  md: 'bg-indigo-100 text-indigo-700', ts: 'bg-blue-100 text-blue-700',
  js: 'bg-yellow-100 text-yellow-700', py: 'bg-emerald-100 text-emerald-700',
  java: 'bg-orange-100 text-orange-700', go: 'bg-cyan-100 text-cyan-700',
  tf: 'bg-violet-100 text-violet-700',
};

function getExt(name: string): string {
  return name.split('.').pop()?.toLowerCase() || '';
}

function TreeItem({ node, depth = 0, onSelect, activeFile }: {
  node: TreeNode; depth?: number;
  onSelect?: (node: TreeNode) => void; activeFile?: string;
}) {
  const [expanded, setExpanded] = useState(depth < 2);
  const isFolder = node.type === 'folder';
  const isActive = activeFile === node.name;
  const ext = getExt(node.name);

  return (
    <div>
      <motion.button
        onClick={() => { if (isFolder) setExpanded(!expanded); onSelect?.(node); }}
        whileHover={{ x: 1 }}
        className={cn(
          'w-full flex items-center gap-2 py-1 px-2 rounded-lg text-xs transition-colors text-left',
          isActive ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-600 hover:bg-slate-50'
        )}
        style={{ paddingLeft: `${depth * 14 + 8}px` }}
      >
        {isFolder ? (
          expanded ? <ChevronDown className="w-3 h-3 text-slate-400 flex-shrink-0" /> : <ChevronRight className="w-3 h-3 text-slate-400 flex-shrink-0" />
        ) : <span className="w-3 flex-shrink-0" />}
        {isFolder
          ? <Folder className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
          : <span className={cn('w-4 h-4 rounded text-[8px] font-bold flex items-center justify-center flex-shrink-0', LANG_COLORS[ext] || 'bg-slate-100 text-slate-600')}>
              {(LANG_ICONS[ext] || ext.slice(0, 1)).toUpperCase()}
            </span>
        }
        <span className="truncate">{node.name}</span>
      </motion.button>

      <AnimatePresence>
        {isFolder && expanded && node.children && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
          >
            {node.children.map((child, i) => (
              <TreeItem key={i} node={child} depth={depth + 1} onSelect={onSelect} activeFile={activeFile} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface FileTreeProps {
  data: TreeNode[];
  onSelect?: (node: TreeNode) => void;
  activeFile?: string;
  title?: string;
}

export default function FileTree({ data, onSelect, activeFile, title = 'Repository' }: FileTreeProps) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2">{title}</p>
      <div className="space-y-0.5">
        {data.map((node, i) => (
          <TreeItem key={i} node={node} onSelect={onSelect} activeFile={activeFile} />
        ))}
      </div>
    </div>
  );
}