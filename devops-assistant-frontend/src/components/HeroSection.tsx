'use client';

import { motion } from 'framer-motion';
import { ArrowRight, GitBranch, Container, Shield, Workflow } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const codeSnippets = [
  { lang: 'dockerfile', code: 'FROM node:20-alpine\nWORKDIR /app\nCOPY . .\nRUN npm ci', color: 'bg-blue-500' },
  { lang: 'yaml', code: 'name: CI/CD\non: [push]\njobs:\n  build:\n    runs-on: ubuntu', color: 'bg-amber-500' },
  { lang: 'json', code: '{\n  "name": "api-gateway",\n  "version": "2.1.0"\n}', color: 'bg-emerald-500' },
];

const stats = [
  { label: 'Artifact types', value: '11' },
  { label: 'LLM calls per run', value: '1' },
  { label: 'AI providers', value: '2' },
];

export default function HeroSection() {
  const [typedText, setTypedText] = useState('');
  const fullText = 'review-ready DevOps';

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i <= fullText.length) {
        setTypedText(fullText.slice(0, i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 50);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-200/40 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-200/40 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-100/30 rounded-full blur-[150px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.05)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-medium mb-6"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
              </span>
              Now with Gemini AI Integration
            </motion.div>

            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1] mb-6">
              Generate{' '}
              <span className="text-gradient">{typedText}</span>
              <span className="animate-pulse text-indigo-600">|</span>
              <br />
              in seconds.
            </h1>

            <p className="text-lg text-slate-500 leading-relaxed mb-8 max-w-lg">
              Draft Docker containers, CI/CD pipelines, and security reviews from your codebase. Review and adapt every generated file before deploying.
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <motion.a
                href="#workspace"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-xl shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-shadow"
              >
                Start Generating
                <ArrowRight className="w-4 h-4" />
              </motion.a>
              <motion.a
                href="#features"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-700 font-semibold rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors"
              >
                Explore Features
              </motion.a>
            </div>

            <div className="flex items-center gap-8">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                >
                  <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                  <div className="text-sm text-slate-500">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
            className="relative hidden lg:block"
          >
            {codeSnippets.map((snippet, i) => (
              <motion.div
                key={i}
                className={cn(
                  'absolute bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 font-mono text-xs overflow-hidden',
                  i === 0 && 'top-0 right-0 w-72 animate-float',
                  i === 1 && 'top-32 left-0 w-64 animate-float-delayed',
                  i === 2 && 'bottom-0 right-12 w-60 animate-float'
                )}
                style={{ animationDelay: `${i * 0.5}s` }}
                whileHover={{ scale: 1.05, rotate: 0 }}
              >
                <div className="flex items-center gap-1.5 mb-3">
                  <div className={cn('w-2.5 h-2.5 rounded-full', snippet.color)} />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                  <span className="ml-2 text-[10px] text-slate-400 uppercase tracking-wider">{snippet.lang}</span>
                </div>
                <pre className="text-slate-600 leading-relaxed">{snippet.code}</pre>
              </motion.div>
            ))}

            <div className="relative z-10 mx-auto w-80 h-80">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-violet-500/10 rounded-3xl border border-indigo-100 backdrop-blur-sm flex items-center justify-center">
                <div className="grid grid-cols-2 gap-4 p-8">
                  <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center">
                    <GitBranch className="w-7 h-7 text-indigo-600" />
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center">
                    <Container className="w-7 h-7 text-blue-600" />
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center">
                    <Shield className="w-7 h-7 text-emerald-600" />
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center">
                    <Workflow className="w-7 h-7 text-violet-600" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}