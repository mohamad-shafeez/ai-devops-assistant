'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Circle, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PipelineStage } from '@/types';

interface PipelineTimelineProps {
  stages: PipelineStage[];
}

const StatusIcon = ({ status }: { status: PipelineStage['status'] }) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-5 h-5 text-emerald-500" />;
    case 'active':
      return <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />;
    case 'failed':
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    default:
      return <Circle className="w-5 h-5 text-slate-300" />;
  }
};

export default function PipelineTimeline({ stages }: PipelineTimelineProps) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-3">
        Pipeline
      </p>
      <div className="relative pl-6">
        {/* Vertical line */}
        <div className="absolute left-[18px] top-2 bottom-2 w-px bg-slate-200" />

        <div className="space-y-1">
          {stages.map((stage, i) => (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="relative flex items-center gap-3 py-1.5"
            >
              {/* Dot */}
              <div className="absolute -left-6 flex-shrink-0">
                <StatusIcon status={stage.status} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={cn(
                  'text-xs font-medium truncate',
                  stage.status === 'completed' ? 'text-slate-700' :
                  stage.status === 'active' ? 'text-indigo-700' :
                  stage.status === 'failed' ? 'text-red-700' :
                  'text-slate-400'
                )}>
                  {stage.label}
                </p>
                {stage.status === 'active' && (
                  <motion.div
                    className="mt-1 h-0.5 bg-slate-100 rounded-full overflow-hidden"
                  >
                    <motion.div
                      className="h-full bg-gradient-to-r from-indigo-500 to-violet-500"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}