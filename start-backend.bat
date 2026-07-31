@echo off
echo ===================================================
echo   Starting AI DevOps Assistant Backend Service
echo ===================================================

:: Load environment variables from .env if present
if exist .env (
    for /f "tokens=*" %%i in (.env) do set %%i
)

:: Check GEMINI_API_KEY
if "%GEMINI_API_KEY%"=="" (
    echo [WARNING] GEMINI_API_KEY environment variable is not set.
    echo Please set GEMINI_API_KEY in your environment or in a .env file.
) else (
    echo [2/3] GEMINI_API_KEY is configured.
)

:: Ensure Docker container (PostgreSQL) is running
echo [1/3] Starting PostgreSQL Container...
docker-compose up -d postgres

:: Check directory context and navigate if needed
if exist "devops-assistant-backend" (
    cd devops-assistant-backend
)

:: Launch Spring Boot using Scoop Maven or System Maven
echo [3/3] Launching Spring Boot Backend...
if exist "%USERPROFILE%\scoop\apps\maven\current\bin\mvn.cmd" (
    "%USERPROFILE%\scoop\apps\maven\current\bin\mvn" spring-boot:run
) else (
    mvn spring-boot:run
)