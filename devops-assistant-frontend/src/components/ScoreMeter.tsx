'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ScoreMeterProps {
  value: number;
  label: string;
  size?: number;
  color?: 'emerald' | 'amber' | 'red' | 'indigo' | 'blue';
}

export default function ScoreMeter({ value, label, size = 80, color = 'indigo' }: ScoreMeterProps) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  const colorMap = {
    emerald: { text: 'text-emerald-600', stroke: 'stroke-emerald-500' },
    amber: { text: 'text-amber-600', stroke: 'stroke-amber-500' },
    red: { text: 'text-red-600', stroke: 'stroke-red-500' },
    indigo: { text: 'text-indigo-600', stroke: 'stroke-indigo-500' },
    blue: { text: 'text-blue-600', stroke: 'stroke-blue-500' },
  };

  const colors = colorMap[color];

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-100"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className={colors.stroke}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn('text-lg font-bold', colors.text)}>
            {value}
          </span>
        </div>
      </div>
      <span className="text-xs font-medium text-slate-600 text-center">{label}</span>
    </div>
  );
}