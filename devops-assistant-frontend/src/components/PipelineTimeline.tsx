'use client';

import { motion } from 'framer-motion';
import { GitBranch, Container, ShieldCheck, Rocket, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PipelineStage } from '@/types';

interface PipelineTimelineProps {
  stages: PipelineStage[];
}

export default function PipelineTimeline({ stages }: PipelineTimelineProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
        Pipeline Status
      </h3>
      <div className="relative">
        {stages.map((stage, i) => {
          const Icon = stage.icon || Circle;
          const isLast = i === stages.length - 1;

          return (
            <div key={stage.id} className="relative flex items-start gap-3 pb-6 last:pb-0">
              {!isLast && (
                <div className={cn(
                  'absolute left-[18px] top-8 w-0.5 h-full',
                  stage.status === 'completed' ? 'bg-emerald-400' : 'bg-slate-100'
                )} />
              )}

              <motion.div
                initial={false}
                animate={stage.status === 'completed' ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
                className={cn(
                  'relative z-10 w-9 h-9 rounded-full flex items-center justify-center shrink-0 border-2',
                  stage.status === 'completed' && 'bg-emerald-50 border-emerald-500 text-emerald-600',
                  stage.status === 'active' && 'bg-indigo-50 border-indigo-500 text-indigo-600 shadow-lg shadow-indigo-500/20',
                  stage.status === 'pending' && 'bg-slate-50 border-slate-200 text-slate-400'
                )}
              >
                {stage.status === 'completed' ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </motion.div>

              <div className="flex-1 pt-1">
                <p className={cn(
                  'text-sm font-semibold',
                  stage.status === 'completed' ? 'text-emerald-700' :
                    stage.status === 'active' ? 'text-indigo-700' :
                      'text-slate-500'
                )}>
                  {stage.label}
                </p>
                {stage.status === 'active' && (
                  <motion.div
                    className="mt-2 h-1 bg-slate-100 rounded-full overflow-hidden"
                  >
                    <motion.div
                      className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"
                      animate={{ width: ['0%', '100%'] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  </motion.div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}