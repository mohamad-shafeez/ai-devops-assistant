package com.devops.assistant.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class GithubService {

    @Value("${github.token:}")
    private String githubToken;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final Pattern GITHUB_URL_PATTERN = Pattern.compile(
            "github\\.com/([^/]+)/([^/\\.]+)"
    );

    /**
     * Parses a GitHub URL or owner/repo string to fetch recursive tree metadata via GitHub REST API.
     */
    public String fetchGithubRepoTree(String repositoryUrl) {
        if (repositoryUrl == null || repositoryUrl.isBlank()) {
            return "";
        }

        String[] ownerAndRepo = parseOwnerAndRepo(repositoryUrl);
        if (ownerAndRepo == null) {
            return "Repository URL provided: " + repositoryUrl;
        }

        String owner = ownerAndRepo[0];
        String repo = ownerAndRepo[1];

        // Try main branch first, fall back to master
        String treeContent = fetchTreeForBranch(owner, repo, "main");
        if (treeContent.isEmpty() || treeContent.startsWith("Error")) {
            treeContent = fetchTreeForBranch(owner, repo, "master");
        }

        if (treeContent.isEmpty() || treeContent.startsWith("Error")) {
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
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "DevOpsAI-Platform");
            headers.set("Accept", "application/vnd.github.v3+json");

            if (githubToken != null && !githubToken.isBlank()) {
                headers.set("Authorization", "Bearer " + githubToken);
            }

            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(apiUrl, HttpMethod.GET, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return formatTreeResponse(response.getBody());
            }
        } catch (Exception e) {
            System.err.println("[GithubService] Failed to fetch GitHub tree for " + owner + "/" + repo + " (" + branch + "): " + e.getMessage());
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

            StringBuilder sb = new StringBuilder("File Structure:\n");
            int count = 0;
            for (JsonNode item : treeNode) {
                String path = item.has("path") ? item.get("path").asText() : "";
                String type = item.has("type") ? item.get("type").asText() : "file";

                if (!path.isEmpty()) {
                    sb.append(type.equals("tree") ? " 📁 " : " 📄 ").append(path).append("\n");
                    count++;
                }

                // Limit output to prevent exceeding prompt tokens
                if (count >= 150) {
                    sb.append("... (showing first 150 files)\n");
                    break;
                }
            }
            return sb.toString();
        } catch (Exception e) {
            return "";
        }
    }
}
