'use client';

import { motion } from 'framer-motion';
import { Terminal, Heart, Code2, MessageCircle, Globe } from 'lucide-react';

const FOOTER_LINKS = {
  Product: ['Features', 'Changelog', 'Roadmap', 'Pricing'],
  Generators: ['Dockerfile', 'Kubernetes', 'Terraform', 'Helm Charts'],
  Resources: ['Documentation', 'API Reference', 'Community', 'Support'],
};

export default function Footer() {
  return (
    <footer className="border-t border-slate-200/60 bg-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-5 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <a href="#" className="flex items-center gap-2.5 mb-4 w-fit">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-md">
                <Terminal className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-slate-900">
                DevOps<span className="text-gradient">AI</span>
              </span>
            </a>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
              Generate production-ready DevOps infrastructure from any codebase using AI.
              Dockerfile, Kubernetes, Terraform, CI/CD and more — in under 60 seconds.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {[Code2, MessageCircle, Globe].map((Icon, i) => (
                <motion.a
                  key={i}
                  href="#"
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-slate-900 mb-4 text-sm">{category}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-slate-500 hover:text-indigo-600 transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-400 flex items-center gap-1.5">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> using Gemini AI · Spring Boot · Next.js
          </p>
          <div className="flex items-center gap-6 text-xs text-slate-400">
            <a href="#" className="hover:text-slate-700 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-700 transition-colors">Terms</a>
            <span>© 2025 DevOpsAI Platform</span>
          </div>
        </div>
      </div>
    </footer>
  );
}