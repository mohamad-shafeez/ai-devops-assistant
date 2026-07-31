'use client';

import { motion } from 'framer-motion';
import { getScoreColor, getRiskColor } from '@/lib/utils';

interface HealthScoreCardProps {
  score: number;
  riskScore?: number;
}

export default function HealthScoreCard({ score, riskScore = 0 }: HealthScoreCardProps) {
  const color = getScoreColor(score);
  const strokeColor = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';

  // SVG donut chart
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="card p-5">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
        Project Health Score
      </h3>
      <div className="flex items-center gap-6">
        {/* Donut */}
        <div className="relative flex-shrink-0">
          <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
            <circle cx="50" cy="50" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="10" />
            <motion.circle
              cx="50" cy="50" r={radius}
              fill="none"
              stroke={strokeColor}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.4, ease: 'easeOut', delay: 0.3 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-bold ${color}`}>{score}</span>
            <span className="text-[10px] text-slate-400">/100</span>
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 space-y-2">
          <div>
            <span className="text-xs text-slate-500">Overall rating</span>
            <p className={`text-sm font-bold ${color}`}>
              {score >= 80 ? 'Production Ready' : score >= 60 ? 'Needs Attention' : 'Requires Work'}
            </p>
          </div>
          {riskScore !== undefined && (
            <div>
              <span className="text-xs text-slate-500">Risk level</span>
              <p className={`text-sm font-bold ${getRiskColor(riskScore)}`}>
                {riskScore <= 30 ? 'Low Risk' : riskScore <= 60 ? 'Medium Risk' : 'High Risk'}
                <span className="font-normal text-slate-400 ml-1">({riskScore}/100)</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
