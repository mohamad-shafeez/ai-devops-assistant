package com.devops.assistant.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class GeminiApiService {

    @Value("${gemini.api.key:}")
    private String apiKey;

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent}")
    private String apiUrl;

    private final WebClient webClient;

    public GeminiApiService(WebClient webClient) {
        this.webClient = webClient;
    }

    private static final int MAX_ATTEMPTS = 4;
    private static final long BASE_DELAY_MS = 2_000;

    public String generateContent(String prompt) {
        if (apiKey == null || apiKey.isEmpty()) {
            log.error("GEMINI_API_KEY environment variable is not configured.");
            return "Error: GEMINI_API_KEY environment variable is not set.";
        }

        String fullUrl = apiUrl + "?key=" + apiKey;

        Map<String, Object> textPart = Map.of("text", prompt);
        Map<String, Object> parts = Map.of("parts", List.of(textPart));
        Map<String, Object> contents = Map.of("contents", List.of(parts));

        return executeWithBackoff(fullUrl, contents);
    }

    @SuppressWarnings("unchecked")
    private String executeWithBackoff(String fullUrl, Map<String, Object> payload) {
        int attempt = 0;
        while (attempt < MAX_ATTEMPTS) {
            attempt++;
            try {
                Map responseBody = webClient.post()
                        .uri(fullUrl)
                        .contentType(MediaType.APPLICATION_JSON)
                        .bodyValue(payload)
                        .retrieve()
                        .bodyToMono(Map.class)
                        .block();

                return extractTextFromGeminiResponse(responseBody);

            } catch (WebClientResponseException e) {
                int statusCode = e.getStatusCode().value();
                if (statusCode == 429) {
                    log.warn("Gemini API HTTP 429 Too Many Requests (attempt {}/{}). Backing off...", attempt, MAX_ATTEMPTS);
                    sleepBackoff(attempt);
                } else if (statusCode == 503) {
                    log.warn("Gemini API HTTP 503 Service Unavailable (attempt {}/{}). Backing off...", attempt, MAX_ATTEMPTS);
                    sleepBackoff(attempt);
                } else {
                    log.error("HTTP error from Gemini API [{}]: {}", statusCode, e.getMessage());
                    return "Error calling Gemini API [" + statusCode + "]: " + e.getMessage();
                }

            } catch (Exception e) {
                log.error("Unexpected error invoking Gemini API: ", e);
                return "Error calling Gemini API: " + e.getMessage();
            }
        }
        log.error("Gemini API unavailable after {} attempts.", MAX_ATTEMPTS);
        return "Error: Gemini API unavailable after " + MAX_ATTEMPTS + " attempts (rate limit or server overload).";
    }

    private void sleepBackoff(int attempt) {
        long delay = BASE_DELAY_MS * (1L << (attempt - 1));
        log.info("Waiting {} ms before retry attempt {}...", delay, attempt + 1);
        try {
            Thread.sleep(delay);
        } catch (InterruptedException ie) {
            Thread.currentThread().interrupt();
            log.warn("Interrupted during exponential backoff sleep");
        }
    }

    @SuppressWarnings("unchecked")
    private String extractTextFromGeminiResponse(Map responseBody) {
        if (responseBody == null) return "No response from Gemini";

        List candidates = (List) responseBody.get("candidates");
        if (candidates == null || candidates.isEmpty()) return "No candidates returned";

        Map firstCandidate = (Map) candidates.get(0);
        Map content = (Map) firstCandidate.get("content");
        List parts = (List) content.get("parts");
        Map firstPart = (Map) parts.get(0);

        return (String) firstPart.get("text");
    }
}