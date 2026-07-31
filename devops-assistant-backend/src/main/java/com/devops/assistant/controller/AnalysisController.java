package com.devops.assistant.controller;

import com.devops.assistant.dto.AnalysisRequest;
import com.devops.assistant.dto.AnalysisResponse;
import com.devops.assistant.model.ProjectAnalysis;
import com.devops.assistant.repository.ProjectAnalysisRepository;
import com.devops.assistant.service.DevOpsGeneratorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/analysis")
@CrossOrigin(origins = "*")
public class AnalysisController {

    private final DevOpsGeneratorService generatorService;
    private final ProjectAnalysisRepository repository;

    public AnalysisController(DevOpsGeneratorService generatorService, ProjectAnalysisRepository repository) {
        this.generatorService = generatorService;
        this.repository = repository;
    }

    @PostMapping
    public ResponseEntity<?> analyzeCode(@jakarta.validation.Valid @RequestBody AnalysisRequest request) {
        try {
            AnalysisResponse response = generatorService.analyzeAndGenerate(request);

            // Persist to database
            ProjectAnalysis entity = ProjectAnalysis.builder()
                    .projectName(request.getProjectName())
                    .architectureDocs(response.getArchitectureDocs())
                    .dockerfile(response.getDockerfile())
                    .dockerCompose(response.getDockerCompose())
                    .githubActions(response.getGithubActions())
                    .kubernetes(response.getKubernetes())
                    .helmChart(response.getHelmChart())
                    .terraform(response.getTerraform())
                    .securityReview(response.getSecurityReview())
                    .codeReview(response.getCodeReview())
                    .envExample(response.getEnvExample())
                    .deploymentReport(response.getDeploymentReport())
                    .recommendations(response.getRecommendations())
                    .healthScore(response.getHealthScore())
                    .securityScore(response.getSecurityScore())
                    .deploymentReadiness(response.getDeploymentReadiness())
                    .containerReadiness(response.getContainerReadiness())
                    .complexity(response.getComplexity())
                    .riskScore(response.getRiskScore())
                    .build();
            repository.save(entity);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("DevOps analysis failed for project: " + request.getProjectName());
            e.printStackTrace();

            // Handle Gemini API Rate Limit / Quota Exceeded specifically
            if (e.getMessage() != null && e.getMessage().contains("429")) {
                return ResponseEntity.status(org.springframework.http.HttpStatus.TOO_MANY_REQUESTS)
                        .body(java.util.Map.of("error", "Gemini API rate limit reached (5 RPM on Free Tier). Please wait 30 seconds and try again."));
            }

            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("error", "Failed to analyze repository: " + e.getMessage()));
        }
    }

    @GetMapping("/history")
    public ResponseEntity<List<ProjectAnalysis>> getHistory() {
        return ResponseEntity.ok(repository.findAll());
    }
}