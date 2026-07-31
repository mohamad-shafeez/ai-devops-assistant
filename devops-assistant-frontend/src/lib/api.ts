import { AnalysisResponse } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function analyzeCodebase(
  projectName: string,
  codeSnippet: string,
  repositoryUrl?: string,
  branch?: string
): Promise<AnalysisResponse> {
  const response = await fetch(`${API_URL}/api/v1/analysis`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectName, codeSnippet, repositoryUrl, branch }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to analyze codebase");
  }

  return response.json();
}

export async function exportAsZip(data: AnalysisResponse): Promise<Blob> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  const folder = zip.folder(data.projectName || "devops-output")!;

  if (data.dockerfile)       folder.file("Dockerfile", data.dockerfile);
  if (data.dockerCompose)    folder.file("docker-compose.yml", data.dockerCompose);
  if (data.envExample)       folder.file(".env.example", data.envExample);
  if (data.githubActions)    folder.folder(".github/workflows")!.file("ci.yml", data.githubActions);
  if (data.kubernetes)       folder.folder("k8s")!.file("manifests.yaml", data.kubernetes);
  if (data.helmChart)        folder.folder("helm")!.file("chart.yaml", data.helmChart);
  if (data.terraform)        folder.folder("terraform")!.file("main.tf", data.terraform);
  if (data.architectureDocs) folder.folder("docs")!.file("ARCHITECTURE.md", data.architectureDocs);
  if (data.securityReview)   folder.folder("docs")!.file("SECURITY.md", data.securityReview);
  if (data.codeReview)       folder.folder("docs")!.file("CODE_REVIEW.md", data.codeReview);
  if (data.deploymentReport) folder.folder("docs")!.file("DEPLOYMENT.md", data.deploymentReport);

  return zip.generateAsync({ type: "blob" });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportAsPdf(data: AnalysisResponse): Promise<void> {
  const content = [
    `# ${data.projectName} — DevOps Platform Report`,
    "",
    data.summary || "",
    "",
    data.architectureDocs || "",
    data.securityReview || "",
    data.codeReview || "",
    data.deploymentReport || "",
  ].join("\n\n");

  const blob = new Blob([content], { type: "text/markdown" });
  downloadBlob(blob, `${data.projectName}-report.md`);
}