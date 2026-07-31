import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DevOpsAI Platform — Generate Infrastructure from Code',
  description:
    'AI-powered DevOps platform that generates Dockerfiles, Kubernetes manifests, Terraform configs, GitHub Actions CI/CD pipelines, Helm charts, and security audits from your source code in seconds.',
  keywords: ['DevOps', 'AI', 'Dockerfile', 'Kubernetes', 'Terraform', 'CI/CD', 'GitHub Actions', 'infrastructure'],
  openGraph: {
    title: 'DevOpsAI Platform',
    description: 'Generate production-ready DevOps infrastructure from any codebase using AI.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased">{children}</body>
    </html>
  );
}