'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Loader2, Container, GitBranch, Shield, Cpu, Globe, BarChart3, FileCode, Layers } from 'lucide-react';

const STAGES = [
  { icon: FileCode, label: 'Analyzing codebase structure', description: 'Parsing files and detecting stack' },
  { icon: Container, label: 'Generating Dockerfile', description: 'Multi-stage production build' },
  { icon: Layers, label: 'Building Docker Compose', description: 'Orchestration with services & volumes' },
  { icon: GitBranch, label: 'Creating CI/CD Pipeline', description: 'GitHub Actions with testing stages' },
  { icon: Cpu, label: 'Generating Kubernetes', description: 'Deployment, Service, Ingress, HPA' },
  { icon: Globe, label: 'Building Terraform config', description: 'AWS infrastructure as code' },
  { icon: Shield, label: 'Running security scan', description: 'Detecting secrets and vulnerabilities' },
  { icon: BarChart3, label: 'Computing health scores', description: 'Security, deployment, complexity' },
];

interface LoadingStateProps {
  currentStage: number;
}

export default function LoadingState({ currentStage }: LoadingStateProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm">
      <div className="max-w-lg w-full mx-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-medium mb-4">
            <Loader2 className="w-4 h-4 animate-spin" />
            AI Generating Infrastructure
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Analyzing your codebase</h2>
          <p className="text-slate-500 mt-2 text-sm">Generating 11 artifacts in one pass. This usually takes 30–60 seconds.</p>
        </motion.div>

        {/* Pipeline stages */}
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-5 top-5 bottom-5 w-px bg-slate-100" />

          <div className="space-y-2">
            {STAGES.map((stage, i) => {
              const isDone = i < currentStage;
              const isActive = i === currentStage;

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: isDone || isActive ? 1 : 0.4, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="relative flex items-center gap-4 pl-12 py-3"
                >
                  {/* Status icon */}
                  <div className="absolute left-0 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0">
                    {isDone ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center"
                      >
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      </motion.div>
                    ) : isActive ? (
                      <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center">
                        <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                        <stage.icon className="w-4 h-4 text-slate-300" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${isDone ? 'text-slate-700' : isActive ? 'text-indigo-700' : 'text-slate-400'}`}>
                      {stage.label}
                    </p>
                    {isActive && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-slate-500 mt-0.5"
                      >
                        {stage.description}
                      </motion.p>
                    )}
                  </div>

                  {/* Active shimmer bar */}
                  {isActive && (
                    <div className="w-24 h-1.5 rounded-full bg-slate-100 overflow-hidden flex-shrink-0">
                      <motion.div
                        className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-8">
          <div className="flex justify-between text-xs text-slate-400 mb-2">
            <span>Progress</span>
            <span>{Math.round((currentStage / STAGES.length) * 100)}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
              animate={{ width: `${(currentStage / STAGES.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}