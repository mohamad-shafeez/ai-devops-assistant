'use client';

import { motion } from 'framer-motion';
import { cn, getScoreBg, getScoreColor, getScoreLabel } from '@/lib/utils';

interface ScoreMeterProps {
  label: string;
  score: number;
  description?: string;
  size?: 'sm' | 'md';
}

export default function ScoreMeter({ label, score, description, size = 'md' }: ScoreMeterProps) {
  const color = getScoreColor(score);
  const bg = getScoreBg(score);
  const text = getScoreLabel(score);

  return (
    <div className={cn('space-y-1.5', size === 'sm' ? 'text-xs' : 'text-sm')}>
      <div className="flex items-center justify-between">
        <span className="font-medium text-slate-700">{label}</span>
        <div className="flex items-center gap-2">
          <span className={cn('font-bold tabular-nums', color)}>{score}</span>
          <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded-md', color, 'bg-opacity-10',
            score >= 80 ? 'bg-emerald-50' : score >= 60 ? 'bg-amber-50' : 'bg-red-50'
          )}>
            {text}
          </span>
        </div>
      </div>
      <div className="score-bar">
        <motion.div
          className={cn('score-fill', bg)}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
        />
      </div>
      {description && (
        <p className="text-[11px] text-slate-400">{description}</p>
      )}
    </div>
  );
}