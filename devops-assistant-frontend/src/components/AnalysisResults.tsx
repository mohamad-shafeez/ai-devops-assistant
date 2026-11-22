'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Container, GitBranch, Shield, FileCode, Download, Layers,
  Cpu, Server, Globe, Lock, BarChart3, Sparkles, Copy, Check,
  ChevronDown, Eye, FileText, ArrowUpRight
} from 'lucide-react';
import { AnalysisResponse, TabId, TabConfig, TreeNode, PipelineStage } from '@/types';
import { cn } from '@/lib/utils';
import { exportAsZip, downloadBlob } from '@/lib/api';
import CodeViewer from './CodeViewer';
import MarkdownRenderer from './MarkdownRenderer';
import FileTree from './FileTree';
import PipelineTimeline from './PipelineTimeline';
import ScoreMeter from './ScoreMeter';
import TechStackCard from './TechStackCard';
import HealthScoreCard from './HealthScoreCard';

// ── Helper: Build generated file tree from response ──────────────────────────
function buildFileTree(data: AnalysisResponse): TreeNode[] {
  const root: TreeNode[] = [];
  const docsChildren: TreeNode[] = [];
  const k8sChildren: TreeNode[] = [];

  if (data.dockerfile)   root.push({ name: 'Dockerfile', type: 'file', icon: 'docker' });
  if (data.dockerCompose) root.push({ name: 'docker-compose.yml', type: 'file', icon: 'yaml' });
  if (data.envExample)   root.push({ name: '.env.example', type: 'file' });
  if (data.githubActions) root.push({
    name: '.github', type: 'folder',
    children: [{ name: 'workflows', type: 'folder', children: [{ name: 'ci.yml', type: 'file', icon: 'yaml' }] }]
  });
  if (data.kubernetes)   k8sChildren.push({ name: 'manifests.yaml', type: 'file', icon: 'yaml' });
  if (data.helmChart)    k8sChildren.push({ name: 'helm-chart.yaml', type: 'file', icon: 'yaml' });
  if (k8sChildren.length) root.push({ name: 'k8s', type: 'folder', children: k8sChildren });
  if (data.terraform)    root.push({ name: 'terraform', type: 'folder', children: [{ name: 'main.tf', type: 'file' }] });
  if (data.architectureDocs) docsChildren.push({ name: 'ARCHITECTURE.md', type: 'file', icon: 'md' });
  if (data.securityReview)   docsChildren.push({ name: 'SECURITY.md', type: 'file', icon: 'md' });
  if (data.codeReview)       docsChildren.push({ name: 'CODE_REVIEW.md', type: 'file', icon: 'md' });
  if (data.deploymentReport) docsChildren.push({ name: 'DEPLOYMENT.md', type: 'file', icon: 'md' });
  if (docsChildren.length)   root.push({ name: 'docs', type: 'folder', children: docsChildren });

  return root;
}

// ── Helper: Pipeline stages from response ────────────────────────────────────
function buildPipelineStages(data: AnalysisResponse): PipelineStage[] {
  const stages = [
    { id: 'arch', label: 'Architecture Analyzed', check: !!data.architectureDocs, icon: FileText },
    { id: 'docker', label: 'Dockerfile Generated', check: !!data.dockerfile, icon: Container },
    { id: 'compose', label: 'Compose Created', check: !!data.dockerCompose, icon: Layers },
    { id: 'ci', label: 'CI/CD Pipeline Built', check: !!data.githubActions, icon: GitBranch },
    { id: 'k8s', label: 'K8s Manifests Generated', check: !!data.kubernetes, icon: Cpu },
    { id: 'security', label: 'Security Scanned', check: !!data.securityReview, icon: Shield },
    { id: 'score', label: 'Health Score Computed', check: !!data.healthScore, icon: BarChart3 },
  ];
  return stages.map(s => ({
    id: s.id,
    label: s.label,
    status: s.check ? 'completed' : 'pending',
    icon: s.icon,
  }));
}

// ── Main Component ────────────────────────────────────────────────────────────
interface AnalysisResultsProps {
  data: AnalysisResponse;
}

export default function AnalysisResults({ data }: AnalysisResultsProps) {
  const [activeTabId, setActiveTabId] = useState<TabId>('overview');
  const [exportLoading, setExportLoading] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const fileTree = useMemo(() => buildFileTree(data), [data]);
  const pipelineStages = useMemo(() => buildPipelineStages(data), [data]);

  const tabs: TabConfig[] = useMemo(() => {
    const allTabs: TabConfig[] = [
      { id: 'overview', label: 'Overview', icon: Sparkles, content: data.summary || data.architectureDocs || '' },
      { id: 'dockerfile', label: 'Dockerfile', icon: Container, content: data.dockerfile || '', language: 'dockerfile', filename: 'Dockerfile' },
      { id: 'compose', label: 'Compose', icon: Layers, content: data.dockerCompose || '', language: 'yaml', filename: 'docker-compose.yml' },
      { id: 'cicd', label: 'CI/CD', icon: GitBranch, content: data.githubActions || data.ciCdPipeline || '', language: 'yaml', filename: '.github/workflows/ci.yml' },
      { id: 'kubernetes', label: 'Kubernetes', icon: Cpu, content: data.kubernetes || '', language: 'yaml', filename: 'k8s/manifests.yaml' },
      { id: 'helm', label: 'Helm', icon: Server, content: data.helmChart || '', language: 'yaml', filename: 'helm/chart.yaml' },
      { id: 'terraform', label: 'Terraform', icon: Globe, content: data.terraform || '', language: 'terraform', filename: 'terraform/main.tf' },
      { id: 'security', label: 'Security', icon: Shield, content: data.securityReview || '', language: 'markdown', filename: 'docs/SECURITY.md' },
      { id: 'codeReview', label: 'Code Review', icon: Eye, content: data.codeReview || '', language: 'markdown', filename: 'docs/CODE_REVIEW.md' },
      { id: 'envExample', label: '.env', icon: Lock, content: data.envExample || '', filename: '.env.example' },
      { id: 'deploymentReport', label: 'Deployment', icon: BarChart3, content: data.deploymentReport || '', language: 'markdown', filename: 'docs/DEPLOYMENT.md' },
    ];
    return allTabs.filter(t => t.content);
  }, [data]);

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  const handleFileSelect = useCallback((node: TreeNode) => {
    if (node.type !== 'file') return;
    const map: Record<string, TabId> = {
      'Dockerfile': 'dockerfile', 'docker-compose.yml': 'compose',
      'ci.yml': 'cicd', 'manifests.yaml': 'kubernetes',
      'helm-chart.yaml': 'helm', 'main.tf': 'terraform',
      'ARCHITECTURE.md': 'overview', 'SECURITY.md': 'security',
      'CODE_REVIEW.md': 'codeReview', 'DEPLOYMENT.md': 'deploymentReport',
      '.env.example': 'envExample',
    };
    const tab = map[node.name];
    if (tab) setActiveTabId(tab);
  }, []);

  const handleExportZip = useCallback(async () => {
    setExportLoading(true);
    try {
      const blob = await exportAsZip(data);
      downloadBlob(blob, `${data.projectName || 'devops-output'}.zip`);
    } finally {
      setExportLoading(false);
      setExportOpen(false);
    }
  }, [data]);

  const handleCopyAll = useCallback(() => {
    const all = [data.dockerfile, data.dockerCompose, data.githubActions, data.kubernetes]
      .filter(Boolean).join('\n\n# ───────────────────────────────────\n\n');
    navigator.clipboard.writeText(all).then(() => {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    });
    setExportOpen(false);
  }, [data]);

  return (
    <section className="py-8 px-4 md:px-6 max-w-[1600px] mx-auto">
      {/* Header bar */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6 flex-wrap gap-4"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Analysis Complete</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            {data.projectName || 'Project'} Infrastructure
          </h2>
        </div>

        {/* Export dropdown */}
        <div className="relative">
          <button
            onClick={() => setExportOpen(!exportOpen)}
            className="btn-primary"
          >
            <Download className="w-4 h-4" />
            Export
            <ChevronDown className={cn('w-4 h-4 transition-transform', exportOpen && 'rotate-180')} />
          </button>

          <AnimatePresence>
            {exportOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.12 }}
                className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden z-50"
              >
                <button
                  onClick={handleExportZip}
                  disabled={exportLoading}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Download className="w-4 h-4 text-indigo-500" />
                  {exportLoading ? 'Packaging...' : 'Download ZIP'}
                </button>
                <button
                  onClick={handleCopyAll}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors border-t border-slate-100"
                >
                  {copiedAll ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
                  {copiedAll ? 'Copied!' : 'Copy All Code'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_260px] gap-6">

        {/* ── LEFT SIDEBAR ────────────────────────────────────────────────── */}
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <div className="card p-4 space-y-5">
            <FileTree data={fileTree} onSelect={handleFileSelect} activeFile={activeTab?.filename?.split('/').pop()} />
            <div className="border-t border-slate-100 pt-4">
              <PipelineTimeline stages={pipelineStages} />
            </div>
          </div>

          {/* Artifact chips */}
          <div className="card p-4">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Generated Files</p>
            <div className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTabId(tab.id)}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left',
                    activeTabId === tab.id
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  )}
                >
                  <tab.icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{tab.filename || tab.label}</span>
                  {activeTabId === tab.id && (
                    <ArrowUpRight className="w-3 h-3 ml-auto flex-shrink-0 opacity-50" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </motion.aside>

        {/* ── CENTER VIEWER ───────────────────────────────────────────────── */}
        <motion.main
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="min-w-0"
        >
          {/* Tab strip */}
          <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-1 scrollbar-none">
            {tabs.slice(0, 8).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex-shrink-0',
                  activeTabId === tab.id
                    ? 'bg-white text-indigo-700 border border-slate-200 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'
                )}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
            {tabs.length > 8 && (
              <div className="flex items-center gap-1">
                {tabs.slice(8).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTabId(tab.id)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex-shrink-0',
                      activeTabId === tab.id
                        ? 'bg-white text-indigo-700 border border-slate-200 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'
                    )}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {activeTab && (
              <motion.div
                key={activeTab.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                {activeTab.id === 'overview' || activeTab.language === 'markdown' ? (
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm">
                    <MarkdownRenderer content={activeTab.content} />
                  </div>
                ) : (
                  <CodeViewer
                    code={activeTab.content}
                    language={activeTab.language}
                    filename={activeTab.filename}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.main>

        {/* ── RIGHT INSIGHTS PANEL ────────────────────────────────────────── */}
        <motion.aside
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {/* Health Score */}
          <HealthScoreCard score={data.healthScore || 0} riskScore={data.riskScore} />

          {/* Scores */}
          <div className="card p-5 space-y-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Score Breakdown
            </h3>
            <ScoreMeter label="Security" value={data.securityScore || 0} color="emerald" />
            <ScoreMeter label="Deployment Ready" value={data.deploymentReadiness || 0} color="indigo" />
            <ScoreMeter label="Container Ready" value={data.containerReadiness || 0} color="blue" />
            <ScoreMeter label="Complexity" value={data.complexity || 0} color="amber" />
          </div>

          {/* Tech Stack */}
          <TechStackCard
            languages={data.detectedLanguages}
            framework={data.detectedFramework}
            database={data.detectedDatabase}
            runtime={data.detectedRuntime}
          />

          {/* Suggestions */}
          {data.suggestions && data.suggestions.length > 0 && (
            <div className="card p-5">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                AI Suggestions
              </h3>
              <ul className="space-y-2">
                {data.suggestions.slice(0, 5).map((s, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.06 }}
                    className="flex items-start gap-2.5 text-xs text-slate-600"
                  >
                    <span className="w-4 h-4 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {s}
                  </motion.li>
                ))}
              </ul>
            </div>
          )}

          {/* Generated artifacts count */}
          <div className="card p-5">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Generated Artifacts
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Total Files', value: tabs.length },
                { label: 'Generators', value: '11' },
                { label: 'AI Calls', value: '1' },
                { label: 'Review', value: 'Required' },
              ].map((item) => (
                <div key={item.label} className="bg-slate-50 rounded-xl p-3 text-center">
                  <div className="text-lg font-bold text-slate-900">{item.value}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.aside>
      </div>
    </section>
  );
}