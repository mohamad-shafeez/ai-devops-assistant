package com.devops.assistant.controller;

import com.devops.assistant.dto.AnalysisRequest;
import com.devops.assistant.dto.AnalysisResponse;
import com.devops.assistant.model.ProjectAnalysis;
import com.devops.assistant.repository.ProjectAnalysisRepository;
import com.devops.assistant.service.DevOpsGeneratorService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/analysis")
public class AnalysisController {

    private final DevOpsGeneratorService generatorService;
    private final ProjectAnalysisRepository repository;

    public AnalysisController(DevOpsGeneratorService generatorService, ProjectAnalysisRepository repository) {
        this.generatorService = generatorService;
        this.repository = repository;
    }

    @PostMapping
    public ResponseEntity<AnalysisResponse> analyzeCode(@Valid @RequestBody AnalysisRequest request) {
        log.info("Received DevOps analysis request for project: '{}'", request.getProjectName());

        AnalysisResponse response = generatorService.analyzeAndGenerate(request);

        // Persist entity to database
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
        log.info("Successfully analyzed and persisted project: '{}'", request.getProjectName());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    public ResponseEntity<Page<ProjectAnalysis>> getHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        log.info("Fetching execution history (page: {}, size: {})", page, size);
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(repository.findAll(pageable));
    }
}