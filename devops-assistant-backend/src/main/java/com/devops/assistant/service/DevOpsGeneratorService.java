package com.devops.assistant.service;

import com.devops.assistant.dto.AnalysisRequest;
import com.devops.assistant.dto.AnalysisResponse;
import com.fasterxml.jackson.core.json.JsonReadFeature;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * DevOpsGeneratorService — Solution A + B combined
 *
 * PROBLEM (before):
 *   This class was making 12 separate calls to the Gemini API sequentially.
 *   On the free tier (15 RPM for gemini-1.5-flash, 5 RPM for gemini-2.5-flash)
 *   that instantly triggered 429 Too Many Requests errors.
 *
 * FIX applied here (Solution A — Single Unified Prompt):
 *   All 12 artifact requests are now combined into ONE structured JSON prompt.
 *   Gemini returns a single JSON object containing every field.
 *   → API calls per generation: 12 → 1
 *   → Free-tier 15 RPM quota stays completely safe.
 *
 * FIX applied in GeminiApiService (Solution B — Exponential Backoff):
 *   If the single call still gets a 429/503 (e.g., transient capacity spike),
 *   GeminiApiService.generateContent() automatically retries up to 4 times
 *   with 2 s → 4 s → 8 s delays before giving up.
 */
@Slf4j
@Service
public class DevOpsGeneratorService {

    private final GeminiApiService geminiApiService;
    private final GroqApiService groqApiService;
    private final GithubService githubService;
    private final ObjectMapper objectMapper = new ObjectMapper()
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
            .enable(JsonReadFeature.ALLOW_UNESCAPED_CONTROL_CHARS.mappedFeature())
            .enable(JsonReadFeature.ALLOW_BACKSLASH_ESCAPING_ANY_CHARACTER.mappedFeature());

    public DevOpsGeneratorService(GeminiApiService geminiApiService, GroqApiService groqApiService, GithubService githubService) {
        this.geminiApiService = geminiApiService;
        this.groqApiService = groqApiService;
        this.githubService = githubService;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // PUBLIC ENTRY POINT
    // ──────────────────────────────────────────────────────────────────────────

    public AnalysisResponse analyzeAndGenerate(AnalysisRequest request) {
        String codeContext = buildCodeContext(request);
        String prompt = buildUnifiedPrompt(codeContext);

        String rawJson;
        try {
            log.info("Generating infrastructure via primary provider (Gemini)...");
            rawJson = geminiApiService.generateContent(prompt);
            if (rawJson != null && rawJson.startsWith("Error")) {
                throw new RuntimeException(rawJson);
            }
        } catch (Exception e) {
            log.warn("Gemini API failed or unavailable (Error: {}). Switching to Groq fallback...", e.getMessage());
            rawJson = groqApiService.generateContent(prompt);
        }

        // Parse the JSON response (or fall back to empty strings on parse error)
        Map<String, Object> parsed = parseJsonResponse(rawJson);

        // ── Extract all artifact strings ───────────────────────────────────────
        String archDocs          = getString(parsed, "architectureDocs");
        String dockerfile        = cleanCodeBlock(getString(parsed, "dockerfile"));
        String dockerCompose     = cleanCodeBlock(getString(parsed, "dockerCompose"));
        String githubActions     = cleanCodeBlock(getString(parsed, "githubActions"));
        String kubernetes        = cleanCodeBlock(getString(parsed, "kubernetesManifests"));
        String helmChart         = cleanCodeBlock(getString(parsed, "helmChart"));
        String terraform         = cleanCodeBlock(getString(parsed, "terraformConfig"));
        String securityReview    = getString(parsed, "securityReview");
        String codeReview        = getString(parsed, "codeReview");
        String envExample        = cleanCodeBlock(getString(parsed, "envExample"));
        String deploymentReport  = getString(parsed, "deploymentReport");

        // ── Extract metadata fields ────────────────────────────────────────────
        List<String> languages   = parseStringList(parsed, "detectedLanguages");
        String framework         = getString(parsed, "detectedFramework");
        String database          = getString(parsed, "detectedDatabase");
        String runtime           = getString(parsed, "detectedRuntime");
        int healthScore          = getInt(parsed, "healthScore",           70);
        int securityScore        = getInt(parsed, "securityScore",         60);
        int deploymentReadiness  = getInt(parsed, "deploymentReadiness",   75);
        int containerReadiness   = getInt(parsed, "containerReadiness",    80);
        int complexity           = getInt(parsed, "complexity",            50);
        int riskScore            = getInt(parsed, "riskScore",             40);
        List<String> suggestions = parseStringList(parsed, "suggestions");

        return AnalysisResponse.builder()
                .projectName(request.getProjectName())
                .summary(archDocs)
                .architectureDocs(archDocs)
                .dockerfile(dockerfile)
                .dockerCompose(dockerCompose)
                .githubActions(githubActions)
                .kubernetes(kubernetes)
                .helmChart(helmChart)
                .terraform(terraform)
                .securityReview(securityReview)
                .codeReview(codeReview)
                .envExample(envExample)
                .deploymentReport(deploymentReport)
                .recommendations(codeReview)
                .detectedLanguages(languages)
                .detectedFramework(framework)
                .detectedDatabase(database)
                .detectedRuntime(runtime)
                .healthScore(healthScore)
                .securityScore(securityScore)
                .deploymentReadiness(deploymentReadiness)
                .containerReadiness(containerReadiness)
                .complexity(complexity)
                .riskScore(riskScore)
                .suggestions(suggestions)
                .build();
    }

    // ──────────────────────────────────────────────────────────────────────────
    // UNIFIED PROMPT  (Solution A — 1 call instead of 12)
    // ──────────────────────────────────────────────────────────────────────────

    private String buildUnifiedPrompt(String codeContext) {
        return """
                You are a Senior DevOps Engineer and Software Architect.
                Analyze the following source code and generate ALL required DevOps infrastructure
                artifacts in a SINGLE valid JSON response — no extra text before or after the JSON.

                Return a JSON object that matches EXACTLY this schema (all string values unless noted):
                {
                  "architectureDocs":    "Markdown — project summary, architecture patterns, module breakdown, tech stack",
                  "dockerfile":          "Raw Dockerfile — multi-stage, non-root user, HEALTHCHECK, EXPOSE, ENV declarations",
                  "dockerCompose":       "Raw docker-compose.yml — app + DB + Redis (if relevant), volumes, networks, health checks",
                  "githubActions":       "Raw .github/workflows/ci.yml — lint, test, Docker build+push, Trivy scan, deploy stub",
                  "kubernetesManifests": "Raw YAML (--- separated) — Deployment, Service, Ingress+TLS, ConfigMap, HPA",
                  "helmChart":           "Raw YAML — Chart.yaml then values.yaml then templates/deployment.yaml, each with a filename comment header",
                  "terraformConfig":     "Raw HCL — AWS provider, ECS/EKS or EC2, security group, optional RDS, S3, variables, outputs",
                  "securityReview":      "Markdown security audit — Critical/High/Medium/Low findings for secrets, SQLi, auth, validation, etc.",
                  "codeReview":          "Markdown code-quality review — performance, smells, error handling, refactoring, test gaps",
                  "envExample":          "Raw .env.example — all referenced env vars with placeholder values and comments",
                  "deploymentReport":    "Markdown deployment readiness report — checklist, missing infra, hardening, monitoring, strategy",
                  "detectedLanguages":   ["JavaScript", "TypeScript"],
                  "detectedFramework":   "Next.js",
                  "detectedDatabase":    "PostgreSQL",
                  "detectedRuntime":     "Node.js",
                  "healthScore":         72,
                  "securityScore":       65,
                  "deploymentReadiness": 80,
                  "containerReadiness":  85,
                  "complexity":          60,
                  "riskScore":           35,
                  "suggestions":         ["Add input validation", "Configure rate limiting", "Add monitoring"]
                }

                IMPORTANT RULES:
                - Respond with ONLY the JSON object. No markdown fences, no preamble, no commentary.
                - All numeric score fields must be integers 0-100.
                - detectedLanguages and suggestions must be JSON arrays of strings.
                - Do not omit any key — use empty string "" or 0 if not applicable.

                Code context:
                """ + codeContext;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // JSON PARSING HELPERS
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Parses the raw Gemini response as JSON.
     * Gemini sometimes wraps the response in markdown fences even when asked not to.
     * We strip those before parsing.
     */
    @SuppressWarnings("unchecked")
    private Map<String, Object> parseJsonResponse(String raw) {
        if (raw == null || raw.startsWith("Error")) {
            log.error("AI API returned error response: {}", raw);
            return Map.of();
        }

        String cleaned = raw.trim();

        // Extract JSON object by finding outer braces
        int firstBrace = cleaned.indexOf('{');
        int lastBrace = cleaned.lastIndexOf('}');
        if (firstBrace != -1 && lastBrace > firstBrace) {
            cleaned = cleaned.substring(firstBrace, lastBrace + 1);
        } else if (cleaned.startsWith("```")) {
            cleaned = cleaned.replaceAll("^```[a-zA-Z]*\\s*", "").replaceAll("\\s*```$", "").trim();
        }

        try {
            return objectMapper.readValue(cleaned, Map.class);
        } catch (Exception e) {
            log.error("Failed to parse AI JSON response: {}", e.getMessage());
            log.debug("Raw response was:\n{}", raw);
            return Map.of();
        }
    }

    private String getString(Map<String, Object> map, String key) {
        Object v = map.get(key);
        return v instanceof String ? (String) v : (v != null ? v.toString() : "");
    }

    private int getInt(Map<String, Object> map, String key, int defaultValue) {
        Object v = map.get(key);
        if (v instanceof Number) return Math.min(100, Math.max(0, ((Number) v).intValue()));
        if (v instanceof String) {
            try { return Math.min(100, Math.max(0, Integer.parseInt(((String) v).trim()))); }
            catch (NumberFormatException ignored) {}
        }
        return defaultValue;
    }

    @SuppressWarnings("unchecked")
    private List<String> parseStringList(Map<String, Object> map, String key) {
        Object v = map.get(key);
        if (v instanceof List) {
            return ((List<Object>) v).stream()
                    .map(Object::toString)
                    .toList();
        }
        if (v instanceof String && !((String) v).isBlank()) {
            return Arrays.asList(((String) v).split(",\\s*"));
        }
        return List.of();
    }

    // ──────────────────────────────────────────────────────────────────────────
    // UTILITY HELPERS
    // ──────────────────────────────────────────────────────────────────────────

    private String buildCodeContext(AnalysisRequest request) {
        StringBuilder sb = new StringBuilder();
        if (request.getProjectName() != null && !request.getProjectName().isBlank()) {
            sb.append("Project: ").append(request.getProjectName()).append("\n\n");
        }
        if (request.getRepositoryUrl() != null && !request.getRepositoryUrl().isBlank()) {
            String githubInfo = githubService.fetchGithubRepoTree(request.getRepositoryUrl());
            sb.append(githubInfo).append("\n\n");
        }
        if (request.getCodeSnippet() != null && !request.getCodeSnippet().isBlank()) {
            sb.append(request.getCodeSnippet());
        } else if (request.getFiles() != null && !request.getFiles().isBlank()) {
            sb.append(request.getFiles());
        }
        return sb.toString();
    }

    private String cleanCodeBlock(String text) {
        if (text == null) return "";
        return text.replaceAll("```[a-zA-Z]*\\n?", "").replaceAll("```", "").trim();
    }

    // ──────────────────────────────────────────────────────────────────────────
    // LEGACY HELPERS — kept in case other code calls them
    // ──────────────────────────────────────────────────────────────────────────

    private List<String> parseList(String text, String key) {
        String value = parseSingle(text, key);
        if (value.isEmpty()) return List.of();
        return Arrays.asList(value.split(",\\s*"));
    }

    private String parseSingle(String text, String key) {
        if (text == null) return "";
        Pattern p = Pattern.compile("^" + key + ":\\s*(.+)$", Pattern.MULTILINE);
        Matcher m = p.matcher(text);
        return m.find() ? m.group(1).trim() : "";
    }

    private Integer parseInt(String text, String key, int defaultValue) {
        String val = parseSingle(text, key);
        try {
            int parsed = Integer.parseInt(val.trim());
            return Math.min(100, Math.max(0, parsed));
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }
}