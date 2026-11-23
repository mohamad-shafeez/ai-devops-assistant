'use client';

import { motion } from 'framer-motion';
import {
  Container, GitBranch, Shield, FileCode, Download, Layers,
  Cpu, Server, Lock, Globe, Zap, BarChart3
} from 'lucide-react';

const features = [
  {
    icon: Container,
    title: 'Dockerfile Generator',
    description: 'Multi-stage starter Dockerfiles with security hardening, non-root users, and health checks.',
    gradient: 'from-blue-500 to-cyan-500',
    tag: 'Core',
  },
  {
    icon: Layers,
    title: 'Docker Compose',
    description: 'Complete orchestration with networking, volumes, database services, and environment variables.',
    gradient: 'from-indigo-500 to-violet-500',
    tag: 'Core',
  },
  {
    icon: GitBranch,
    title: 'CI/CD Pipelines',
    description: 'GitHub Actions workflows with testing, building, container scanning, and deployment stages.',
    gradient: 'from-violet-500 to-purple-500',
    tag: 'Core',
  },
  {
    icon: Cpu,
    title: 'Kubernetes Manifests',
    description: 'Deployment, Service, Ingress, ConfigMap and HPA resources with proper resource limits.',
    gradient: 'from-sky-500 to-blue-500',
    tag: 'Platform',
  },
  {
    icon: Server,
    title: 'Helm Charts',
    description: 'Starter Helm charts with Chart.yaml, values.yaml, and templated deployment manifests.',
    gradient: 'from-teal-500 to-emerald-500',
    tag: 'Platform',
  },
  {
    icon: Globe,
    title: 'Terraform Configs',
    description: 'AWS infrastructure as code with ECS, RDS, S3, security groups and variable files.',
    gradient: 'from-amber-500 to-orange-500',
    tag: 'Platform',
  },
  {
    icon: Shield,
    title: 'Security Review',
    description: 'LLM-assisted review of hardcoded secrets, SQL injection risks, and auth gaps.',
    gradient: 'from-rose-500 to-red-500',
    tag: 'Security',
  },
  {
    icon: Lock,
    title: '.env.example Generator',
    description: 'Automatically extracts and documents all environment variables with placeholder values.',
    gradient: 'from-pink-500 to-rose-500',
    tag: 'Security',
  },
  {
    icon: BarChart3,
    title: 'Project Health Score',
    description: 'Derived 0-100 summary of security, deployment readiness, and complexity.',
    gradient: 'from-emerald-500 to-teal-500',
    tag: 'Insights',
  },
  {
    icon: FileCode,
    title: 'Architecture Docs',
    description: 'AI-generated Markdown documentation explaining architecture, patterns, and data flow.',
    gradient: 'from-slate-600 to-slate-800',
    tag: 'Docs',
  },
  {
    icon: Zap,
    title: 'Deployment Readiness',
    description: 'Deployment readiness checklist with monitoring gaps, performance, and strategy recommendations.',
    gradient: 'from-yellow-500 to-amber-500',
    tag: 'Insights',
  },
  {
    icon: Download,
    title: 'One-Click Export',
    description: 'Export everything as a structured ZIP bundle with proper folder hierarchy.',
    gradient: 'from-fuchsia-500 to-purple-500',
    tag: 'Export',
  },
];

const tagColors: Record<string, string> = {
  Core: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  Platform: 'bg-blue-50 text-blue-700 border-blue-100',
  Security: 'bg-red-50 text-red-700 border-red-100',
  Insights: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  Docs: 'bg-slate-100 text-slate-700 border-slate-200',
  Export: 'bg-purple-50 text-purple-700 border-purple-100',
};

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="badge bg-indigo-50 text-indigo-700 border border-indigo-100 mb-4">
            11 Artifacts + Review Scores
          </span>
          <h2 className="text-4xl font-bold text-slate-900 mb-4 mt-2">
            A review-ready starting point,{' '}
            <span className="text-gradient">automatically.</span>
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            From containers to Kubernetes to Terraform — one codebase, a complete starter bundle.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="group card p-5 cursor-default overflow-hidden relative"
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-300 rounded-lg`} />

              <div className="relative">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-md flex-shrink-0`}>
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className={`badge border text-[10px] ${tagColors[feature.tag]}`}>
                    {feature.tag}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1.5">{feature.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}