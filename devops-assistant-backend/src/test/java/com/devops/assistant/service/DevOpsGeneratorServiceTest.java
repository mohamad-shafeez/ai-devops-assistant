package com.devops.assistant.service;

import com.devops.assistant.dto.AnalysisRequest;
import com.devops.assistant.dto.AnalysisResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

class DevOpsGeneratorServiceTest {

    @Mock
    private GeminiApiService geminiApiService;

    @Mock
    private GithubService githubService;

    @InjectMocks
    private DevOpsGeneratorService generatorService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    @DisplayName("analyzeAndGenerate parses valid JSON response from Gemini API")
    void testAnalyzeAndGenerateSuccess() {
        String mockJsonResponse = """
                {
                  "architectureDocs": "Sample Architecture Docs",
                  "dockerfile": "FROM node:18-alpine\\nWORKDIR /app",
                  "dockerCompose": "version: '3.8'",
                  "githubActions": "name: CI",
                  "kubernetesManifests": "apiVersion: apps/v1",
                  "helmChart": "apiVersion: v2",
                  "terraformConfig": "provider \\"aws\\" {}",
                  "securityReview": "No issues",
                  "codeReview": "Looks good",
                  "envExample": "PORT=8080",
                  "deploymentReport": "Ready",
                  "detectedLanguages": ["Java", "TypeScript"],
                  "detectedFramework": "Spring Boot",
                  "detectedDatabase": "PostgreSQL",
                  "detectedRuntime": "Java 17",
                  "healthScore": 85,
                  "securityScore": 90,
                  "deploymentReadiness": 88,
                  "containerReadiness": 92,
                  "complexity": 40,
                  "riskScore": 15,
                  "suggestions": ["Add unit tests"]
                }
                """;

        when(geminiApiService.generateContent(anyString())).thenReturn(mockJsonResponse);

        AnalysisRequest request = AnalysisRequest.builder()
                .projectName("demo-service")
                .codeSnippet("System.out.println(\"Hello\");")
                .build();

        AnalysisResponse response = generatorService.analyzeAndGenerate(request);

        assertNotNull(response);
        assertEquals("demo-service", response.getProjectName());
        assertEquals("Sample Architecture Docs", response.getArchitectureDocs());
        assertEquals("FROM node:18-alpine\nWORKDIR /app", response.getDockerfile());
        assertEquals(85, response.getHealthScore());
        assertEquals(90, response.getSecurityScore());
        assertEquals("Spring Boot", response.getDetectedFramework());
        assertEquals(1, response.getSuggestions().size());
    }
}
