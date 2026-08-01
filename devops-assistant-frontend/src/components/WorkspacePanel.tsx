'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, Upload, GitBranch, Loader2, Zap, X, FileText, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { InputMode } from '@/types';

interface WorkspacePanelProps {
  projectName: string;
  setProjectName: (v: string) => void;
  codeSnippet: string;
  setCodeSnippet: (v: string) => void;
  repositoryUrl: string;
  setRepositoryUrl: (v: string) => void;
  uploadedFileName: string;
  setUploadedFileName: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  error: string | null;
}

const TABS: { id: InputMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'code', label: 'Paste Code', icon: Code2 },
  { id: 'upload', label: 'Upload Files', icon: Upload },
  { id: 'github', label: 'GitHub Repo', icon: GitBranch },
];

const PLACEHOLDER_CODE = `{
  "name": "my-api",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.18.0",
    "pg": "^8.11.0",
    "redis": "^4.6.0"
  },
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  }
}`;

export default function WorkspacePanel({
  projectName, setProjectName,
  codeSnippet, setCodeSnippet,
  repositoryUrl, setRepositoryUrl,
  uploadedFileName, setUploadedFileName,
  onSubmit, loading, error,
}: WorkspacePanelProps) {
  const [activeTab, setActiveTab] = useState<InputMode>('code');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const names: string[] = [];
    let combined = '';

    Array.from(files).forEach((file) => {
      names.push(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        combined += `\n// ===== ${file.name} =====\n${e.target?.result as string}`;
        setCodeSnippet(combined);
      };
      reader.readAsText(file);
    });

    setUploadedFiles(names);
    setUploadedFileName(names.join(', '));
  }, [setCodeSnippet, setUploadedFileName]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const isValid = projectName.trim() && (
    (activeTab === 'code' && codeSnippet.trim()) ||
    (activeTab === 'upload' && uploadedFiles.length > 0) ||
    (activeTab === 'github' && repositoryUrl.trim())
  );

  return (
    <section id="workspace" className="py-24 bg-slate-50/50 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_0%,rgba(99,102,241,0.05),transparent)]" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 id="how-it-works" className="text-4xl font-bold text-slate-900 mb-4">
            Generate your infrastructure
          </h2>
          <p className="text-lg text-slate-500">
            Provide your code and let AI do the heavy lifting.
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 overflow-hidden"
        >
          {/* Project Name */}
          <div className="px-8 pt-8 pb-6 border-b border-slate-100">
            <label htmlFor="projectName" className="block text-sm font-semibold text-slate-700 mb-2">
              Project Name
            </label>
            <input
              id="projectName"
              type="text"
              suppressHydrationWarning
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. ecommerce-api, dashboard-service"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-slate-900 font-medium placeholder:text-slate-400 placeholder:font-normal text-sm"
            />
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-100 px-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                suppressHydrationWarning
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all relative',
                  activeTab === tab.id
                    ? 'text-indigo-600 tab-active'
                    : 'text-slate-500 hover:text-slate-700'
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              {activeTab === 'code' && (
                <motion.div
                  key="code"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
                    {/* Editor header */}
                    <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      </div>
                      <span className="text-xs text-slate-500 font-mono">paste your code here</span>
                      {codeSnippet && (
                        <button
                          onClick={() => setCodeSnippet('')}
                          className="text-slate-500 hover:text-white transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    {/* Line numbers + textarea */}
                    <div className="flex bg-slate-950 min-h-[240px]">
                      <div className="select-none py-3 pl-3 pr-2 text-right text-xs text-slate-600 font-mono leading-7 min-w-[40px] border-r border-slate-800">
                        {Array.from({ length: Math.max(10, (codeSnippet || PLACEHOLDER_CODE).split('\n').length) }, (_, i) => (
                          <div key={i}>{i + 1}</div>
                        ))}
                      </div>
                      <textarea
                        ref={textareaRef}
                        suppressHydrationWarning
                        value={codeSnippet}
                        onChange={(e) => setCodeSnippet(e.target.value)}
                        placeholder={PLACEHOLDER_CODE}
                        rows={12}
                        className="flex-1 bg-transparent text-slate-300 text-sm font-mono leading-7 p-3 resize-none outline-none placeholder:text-slate-700"
                        spellCheck={false}
                      />
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">
                    Paste package.json, main app file, requirements.txt, pom.xml, or any source files.
                  </p>
                </motion.div>
              )}

              {activeTab === 'upload' && (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <div
                    onDragEnter={() => setIsDragging(true)}
                    onDragLeave={() => setIsDragging(false)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      'drop-zone rounded-2xl p-12 text-center cursor-pointer transition-all',
                      isDragging ? 'dragging' : 'hover:border-indigo-300 hover:bg-indigo-50/40'
                    )}
                  >
                    <motion.div animate={{ scale: isDragging ? 1.05 : 1 }} transition={{ type: 'spring', stiffness: 300 }}>
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                        <Upload className="w-8 h-8 text-indigo-500" />
                      </div>
                      <p className="text-base font-semibold text-slate-700 mb-1">
                        {isDragging ? 'Drop files here' : 'Drag & drop project files'}
                      </p>
                      <p className="text-sm text-slate-500">or click to browse</p>
                      <p className="mt-3 text-xs text-slate-400">
                        Supports: .js, .ts, .py, .java, .go, .rs, .json, .yml, .toml, .txt
                      </p>
                    </motion.div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => handleFiles(e.target.files)}
                    />
                  </div>

                  {uploadedFiles.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 space-y-2"
                    >
                      {uploadedFiles.map((name) => (
                        <div key={name} className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <span className="text-sm text-slate-700 font-medium">{name}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              )}

              {activeTab === 'github' && (
                <motion.div
                  key="github"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Repository URL
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <GitBranch className="w-5 h-5 text-slate-400" />
                      </div>
                      <input
                        type="url"
                        suppressHydrationWarning
                        value={repositoryUrl}
                        onChange={(e) => setRepositoryUrl(e.target.value)}
                        placeholder="https://github.com/username/repo"
                        className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-slate-900 placeholder:text-slate-400 font-mono text-sm"
                      />
                    </div>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm font-medium"
                >
                  ⚠ {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              type="submit"
              suppressHydrationWarning
              disabled={loading || !isValid}
              onClick={(e) => onSubmit(e as unknown as React.FormEvent)}
              whileHover={!loading && isValid ? { scale: 1.01 } : {}}
              whileTap={!loading && isValid ? { scale: 0.99 } : {}}
              className={cn(
                'mt-6 w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-semibold text-base transition-all',
                isValid && !loading
                  ? 'bg-slate-900 text-white hover:bg-indigo-600 shadow-lg shadow-slate-900/10 hover:shadow-indigo-500/25'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing & Generating...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Generate Infrastructure
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
