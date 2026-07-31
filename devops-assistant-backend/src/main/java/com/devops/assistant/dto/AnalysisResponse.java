package com.devops.assistant.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalysisResponse {
    // Core artifacts
    private String projectName;
    private String summary;
    private String architectureDocs;
    private String dockerfile;
    private String dockerCompose;
    private String githubActions;
    private String kubernetes;
    private String helmChart;
    private String terraform;
    private String securityReview;
    private String codeReview;
    private String recommendations;
    private String envExample;
    private String deploymentReport;

    // Detected metadata
    private List<String> detectedLanguages;
    private String detectedFramework;
    private String detectedDatabase;
    private String detectedRuntime;

    // Scores (0-100)
    private Integer healthScore;
    private Integer securityScore;
    private Integer deploymentReadiness;
    private Integer containerReadiness;
    private Integer complexity;
    private Integer riskScore;

    // Structured suggestions
    private List<String> suggestions;
}