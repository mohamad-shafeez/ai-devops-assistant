-- V1__init_schema.sql
-- Initializes PostgreSQL schema for project analysis history

CREATE TABLE IF NOT EXISTS project_analyses (
    id BIGSERIAL PRIMARY KEY,
    project_name VARCHAR(255),
    architecture_docs TEXT,
    dockerfile TEXT,
    docker_compose TEXT,
    github_actions TEXT,
    kubernetes TEXT,
    helm_chart TEXT,
    terraform TEXT,
    security_review TEXT,
    code_review TEXT,
    env_example TEXT,
    deployment_report TEXT,
    recommendations TEXT,
    health_score INTEGER,
    security_score INTEGER,
    deployment_readiness INTEGER,
    container_readiness INTEGER,
    complexity INTEGER,
    risk_score INTEGER,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
