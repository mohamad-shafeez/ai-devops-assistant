package com.devops.assistant.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "project_analyses")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String projectName;

    @Column(columnDefinition = "TEXT")
    private String architectureDocs;

    @Column(columnDefinition = "TEXT")
    private String dockerfile;

    @Column(columnDefinition = "TEXT")
    private String dockerCompose;

    @Column(columnDefinition = "TEXT")
    private String githubActions;

    @Column(columnDefinition = "TEXT")
    private String kubernetes;

    @Column(columnDefinition = "TEXT")
    private String helmChart;

    @Column(columnDefinition = "TEXT")
    private String terraform;

    @Column(columnDefinition = "TEXT")
    private String securityReview;

    @Column(columnDefinition = "TEXT")
    private String codeReview;

    @Column(columnDefinition = "TEXT")
    private String envExample;

    @Column(columnDefinition = "TEXT")
    private String deploymentReport;

    @Column(columnDefinition = "TEXT")
    private String recommendations;

    private Integer healthScore;
    private Integer securityScore;
    private Integer deploymentReadiness;
    private Integer containerReadiness;
    private Integer complexity;
    private Integer riskScore;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}