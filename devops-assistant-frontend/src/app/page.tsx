'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import WorkspacePanel from '@/components/WorkspacePanel';
import LoadingState from '@/components/LoadingState';
import AnalysisResults from '@/components/AnalysisResults';
import Footer from '@/components/Footer';
import { analyzeCodebase } from '@/lib/api';
import { AnalysisResponse } from '@/types';

const STAGE_COUNT = 8;
const STAGE_INTERVAL_MS = 5500;

export default function Home() {
  const [projectName, setProjectName] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<AnalysisResponse | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Advance pipeline stage animation during loading
  useEffect(() => {
    if (!loading) { setCurrentStage(0); return; }

    const interval = setInterval(() => {
      setCurrentStage((s) => (s < STAGE_COUNT - 1 ? s + 1 : s));
    }, STAGE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;
    if (!codeSnippet.trim() && !repositoryUrl.trim()) return;

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const data = await analyzeCodebase(projectName, codeSnippet, repositoryUrl);
      setResults(data);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      <HeroSection />

      <FeaturesSection />

      <WorkspacePanel
        projectName={projectName}
        setProjectName={setProjectName}
        codeSnippet={codeSnippet}
        setCodeSnippet={setCodeSnippet}
        repositoryUrl={repositoryUrl}
        setRepositoryUrl={setRepositoryUrl}
        uploadedFileName={uploadedFileName}
        setUploadedFileName={setUploadedFileName}
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
      />

      {/* Loading overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LoadingState currentStage={currentStage} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {results && !loading && (
          <motion.div
            ref={resultsRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="border-t border-slate-200/60 bg-slate-50/40"
          >
            <AnalysisResults data={results} />
          </motion.div>
        )}
      </AnimatePresence>

      {!results && !loading && <div className="py-8" />}

      <Footer />
    </main>
  );
}