'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles, GitBranch, Shield, Container, Cpu, ChevronDown } from 'lucide-react';

const TYPING_PHRASES = [
  'Dockerfile in seconds.',
  'Kubernetes manifests instantly.',
  'GitHub Actions CI/CD pipelines.',
  'Helm charts automatically.',
  'Terraform configs on demand.',
  'Security audits in one click.',
];

const FLOATING_CARDS = [
  {
    icon: Container,
    label: 'Dockerfile',
    sublabel: 'Multi-stage • Optimized',
    color: 'from-blue-500 to-cyan-500',
    delay: 0,
  },
  {
    icon: GitBranch,
    label: 'CI/CD Pipeline',
    sublabel: 'GitHub Actions • Auto',
    color: 'from-violet-500 to-purple-500',
    delay: 1.5,
  },
  {
    icon: Shield,
    label: 'Security Audit',
    sublabel: 'Secrets • Deps • Config',
    color: 'from-emerald-500 to-teal-500',
    delay: 3,
  },
  {
    icon: Cpu,
    label: 'K8s Manifests',
    sublabel: 'Deploy • Scale • Monitor',
    color: 'from-amber-500 to-orange-500',
    delay: 4.5,
  },
];

const STATS = [
  { value: '12+', label: 'Artifacts Generated' },
  { value: '<60s', label: 'Analysis Time' },
  { value: '100%', label: 'AI-Powered' },
  { value: 'Free', label: 'To Get Started' },
];

function TypingAnimation() {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [speed, setSpeed] = useState(80);

  useEffect(() => {
    const phrase = TYPING_PHRASES[phraseIdx];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setDisplayed(phrase.slice(0, displayed.length + 1));
        if (displayed.length + 1 === phrase.length) {
          setTimeout(() => setIsDeleting(true), 1800);
          setSpeed(50);
        }
      } else {
        setDisplayed(phrase.slice(0, displayed.length - 1));
        if (displayed.length === 0) {
          setIsDeleting(false);
          setPhraseIdx((i) => (i + 1) % TYPING_PHRASES.length);
          setSpeed(80);
        }
      }
    }, speed);
    return () => clearTimeout(timeout);
  }, [displayed, isDeleting, phraseIdx, speed]);

  return (
    <span className="text-gradient">
      {displayed}
      <span className="animate-cursor inline-block w-0.5 h-8 bg-indigo-500 ml-1 align-middle" />
    </span>
  );
}

export default function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden gradient-mesh pt-16">
      {/* Decorative blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-100/40 blur-3xl pointer-events-none animate-glow" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] rounded-full bg-violet-100/30 blur-3xl pointer-events-none animate-glow" style={{ animationDelay: '1.5s' }} />
      <div className="absolute top-1/2 right-1/3 w-[300px] h-[300px] rounded-full bg-cyan-100/20 blur-3xl pointer-events-none" />

      <motion.div style={{ y, opacity }} className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-medium mb-8"
        >
          <Sparkles className="w-4 h-4" />
          Powered by Gemini 2.5 Flash · 12 Generators · One Click
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 leading-[1.1] tracking-tight mb-6"
        >
          Generate your{' '}
          <br className="hidden md:block" />
          <TypingAnimation />
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed mb-10"
        >
          Paste your source code, upload project files, or point to a GitHub repo.
          DevOpsAI generates production-ready infrastructure in under 60 seconds.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <a href="#workspace" className="btn-primary text-base px-8 py-3.5 rounded-2xl">
            Start Generating
            <ArrowRight className="w-5 h-5" />
          </a>
          <a href="#features" className="btn-secondary text-base px-8 py-3.5 rounded-2xl">
            See All Features
          </a>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto mb-20"
        >
          {STATS.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
              <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Floating Cards */}
        <div className="relative flex flex-wrap justify-center gap-4">
          {FLOATING_CARDS.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 + i * 0.1 }}
              style={{ animationDelay: `${card.delay}s` }}
              className="animate-float card p-4 flex items-center gap-3 min-w-[200px]"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-md flex-shrink-0`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-slate-900">{card.label}</div>
                <div className="text-xs text-slate-500">{card.sublabel}</div>
              </div>
              <div className="flex-shrink-0 w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-auto" />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-400"
      >
        <span className="text-xs font-medium uppercase tracking-widest">Scroll</span>
        <ChevronDown className="w-4 h-4" />
      </motion.div>
    </section>
  );
}