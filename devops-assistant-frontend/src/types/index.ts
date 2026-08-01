export interface AnalysisResponse {
  // Core identity
  projectName: string;
  summary?: string;

  // Generated artifacts
  architectureDocs?: string;
  dockerfile?: string;
  dockerCompose?: string;
  githubActions?: string;
  ciCdPipeline?: string; // legacy alias
  kubernetes?: string;
  helmChart?: string;
  terraform?: string;
  securityReview?: string;
  codeReview?: string;
  recommendations?: string;
  envExample?: string;
  deploymentReport?: string;

  // Detected metadata
  detectedLanguages?: string[];
  detectedFramework?: string;
  detectedDatabase?: string;
  detectedRuntime?: string;

  // Scores (0–100)
  healthScore?: number;
  securityScore?: number;
  deploymentReadiness?: number;
  containerReadiness?: number;
  complexity?: number;
  riskScore?: number;

  // Suggestions
  suggestions?: string[];
}

export interface TreeNode {
  name: string;
  type: 'folder' | 'file';
  icon?: string;
  language?: string;
  children?: TreeNode[];
}

export interface TechItem {
  name: string;
  category: 'runtime' | 'language' | 'framework' | 'database' | 'tool';
  version?: string;
}

export type PipelineStageStatus = 'completed' | 'active' | 'pending' | 'failed';

export interface PipelineStage {
  id: string;
  label: string;
  description?: string;
  status: PipelineStageStatus;
  icon?: React.ComponentType<{ className?: string }>;
}

export type TabId =
  | 'overview'
  | 'dockerfile'
  | 'compose'
  | 'cicd'
  | 'kubernetes'
  | 'helm'
  | 'terraform'
  | 'security'
  | 'codeReview'
  | 'envExample'
  | 'deploymentReport'
  | 'architecture';

export interface TabConfig {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  content: string;
  language?: string;
  filename?: string;
}

export type InputMode = 'code' | 'upload' | 'github';

export interface ScoreCategory {
  label: string;
  score: number;
  color: string;
  description: string;
}