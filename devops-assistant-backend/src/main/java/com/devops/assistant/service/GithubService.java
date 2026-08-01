package com.devops.assistant.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
public class GithubService {

    @Value("${github.token:}")
    private String githubToken;

    private final WebClient webClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public GithubService(WebClient webClient) {
        this.webClient = webClient;
    }

    private static final Pattern GITHUB_URL_PATTERN = Pattern.compile(
            "github\\.com/([^/]+)/([^/\\.]+)"
    );

    private static final Set<String> IGNORED_EXTENSIONS = Set.of(
            "png", "jpg", "jpeg", "gif", "ico", "svg", "webp", "pdf", "zip", "tar", "gz", "7z", "jar",
            "mp3", "mp4", "mov", "woff", "woff2", "ttf", "eot", "exe", "dll", "so", "dylib", "pyc", "class"
    );

    private static final Set<String> IGNORED_EXACT_NAMES = Set.of(
            "package-lock.json", "yarn.lock", "pnpm-lock.yaml", "cargo.lock", "go.sum", "composer.lock"
    );

    private static final String[] IGNORED_DIRECTORY_PREFIXES = {
            "node_modules/", ".git/", ".next/", "target/", "dist/", "build/", ".idea/", ".vscode/", "coverage/"
    };

    public String fetchGithubRepoTree(String repositoryUrl) {
        if (repositoryUrl == null || repositoryUrl.isBlank()) {
            return "";
        }

        String[] ownerAndRepo = parseOwnerAndRepo(repositoryUrl);
        if (ownerAndRepo == null) {
            log.warn("Invalid GitHub URL format provided: {}", repositoryUrl);
            return "Repository URL provided: " + repositoryUrl;
        }

        String owner = ownerAndRepo[0];
        String repo = ownerAndRepo[1];

        log.info("Fetching GitHub repository tree for {}/{}", owner, repo);

        String treeContent = fetchTreeForBranch(owner, repo, "main");
        if (treeContent.isEmpty() || treeContent.startsWith("Error")) {
            treeContent = fetchTreeForBranch(owner, repo, "master");
        }

        if (treeContent.isEmpty() || treeContent.startsWith("Error")) {
            log.warn("Unable to fetch repository tree for {}/{}", owner, repo);
            return "GitHub Repository: " + owner + "/" + repo + "\n(Unable to fetch recursive tree from GitHub API)";
        }

        return "GitHub Repository: " + owner + "/" + repo + "\n" + treeContent;
    }

    private String[] parseOwnerAndRepo(String url) {
        Matcher matcher = GITHUB_URL_PATTERN.matcher(url);
        if (matcher.find()) {
            return new String[]{matcher.group(1), matcher.group(2)};
        }
        String[] parts = url.trim().split("/");
        if (parts.length == 2 && !parts[0].contains("http")) {
            return new String[]{parts[0], parts[1]};
        }
        return null;
    }

    private String fetchTreeForBranch(String owner, String repo, String branch) {
        String apiUrl = String.format("https://api.github.com/repos/%s/%s/git/trees/%s?recursive=1", owner, repo, branch);

        try {
            WebClient.RequestHeadersSpec<?> requestSpec = webClient.get()
                    .uri(apiUrl)
                    .header("User-Agent", "DevOpsAI-Platform")
                    .header("Accept", "application/vnd.github.v3+json");

            if (githubToken != null && !githubToken.isBlank()) {
                requestSpec = requestSpec.header("Authorization", "Bearer " + githubToken);
            }

            String responseBody = requestSpec.retrieve()
                    .bodyToMono(String.class)
                    .block();

            if (responseBody != null) {
                return formatTreeResponse(responseBody);
            }
        } catch (Exception e) {
            log.warn("Failed to fetch GitHub tree for {}/{} (branch: {}): {}", owner, repo, branch, e.getMessage());
        }
        return "";
    }

    private String formatTreeResponse(String jsonResponseBody) {
        try {
            JsonNode rootNode = objectMapper.readTree(jsonResponseBody);
            JsonNode treeNode = rootNode.get("tree");
            if (treeNode == null || !treeNode.isArray()) {
                return "";
            }

            StringBuilder sb = new StringBuilder("Filtered File Structure:\n");
            int count = 0;
            for (JsonNode item : treeNode) {
                String path = item.has("path") ? item.get("path").asText() : "";
                String type = item.has("type") ? item.get("type").asText() : "file";

                if (shouldIncludePath(path)) {
                    sb.append(type.equals("tree") ? " 📁 " : " 📄 ").append(path).append("\n");
                    count++;
                }

                if (count >= 100) {
                    sb.append("... (showing top 100 relevant files)\n");
                    break;
                }
            }
            return sb.toString();
        } catch (Exception e) {
            log.error("Failed to parse GitHub tree JSON: ", e);
            return "";
        }
    }

    private boolean shouldIncludePath(String path) {
        if (path == null || path.isBlank()) return false;

        String lowerPath = path.toLowerCase();

        for (String dirPrefix : IGNORED_DIRECTORY_PREFIXES) {
            if (lowerPath.startsWith(dirPrefix) || lowerPath.contains("/" + dirPrefix)) {
                return false;
            }
        }

        String filename = lowerPath.contains("/") ? lowerPath.substring(lowerPath.lastIndexOf('/') + 1) : lowerPath;
        if (IGNORED_EXACT_NAMES.contains(filename)) {
            return false;
        }

        if (filename.contains(".")) {
            String ext = filename.substring(filename.lastIndexOf('.') + 1);
            if (IGNORED_EXTENSIONS.contains(ext)) {
                return false;
            }
        }

        return true;
    }
}
