package com.devops.assistant.repository;

import com.devops.assistant.model.ProjectAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectAnalysisRepository extends JpaRepository<ProjectAnalysis, Long> {
}