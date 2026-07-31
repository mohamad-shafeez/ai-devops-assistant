package com.devops.assistant.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalysisRequest {
    @NotBlank(message = "Project name is required")
    private String projectName;
    private String repositoryUrl;
    private String branch;
    private String codeSnippet;
    private String files;
}