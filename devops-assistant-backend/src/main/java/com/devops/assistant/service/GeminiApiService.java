package com.devops.assistant.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import java.util.*;

@Service
public class GeminiApiService {

    @Value("${gemini.api.key:}")
    private String apiKey;

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public String generateContent(String prompt) {
        if (apiKey == null || apiKey.isEmpty()) {
            return "Error: GEMINI_API_KEY environment variable is not set.";
        }

        String fullUrl = apiUrl + "?key=" + apiKey;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> textPart = Map.of("text", prompt);
        Map<String, Object> parts = Map.of("parts", List.of(textPart));
        Map<String, Object> contents = Map.of("contents", List.of(parts));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(contents, headers);

        return executeWithBackoff(fullUrl, entity);
    }

    /**
     * Executes a Gemini API call with exponential backoff retry.
     *
     * Free-tier limits:
     * - gemini-1.5-flash : 15 RPM, 1 000 000 TPD
     * - gemini-2.5-flash : 5 RPM, 250 000 TPD
     *
     * Strategy: up to MAX_ATTEMPTS tries.
     * Attempt 1 → immediate
     * Attempt 2 → wait 2 s
     * Attempt 3 → wait 4 s
     * Attempt 4 → wait 8 s
     *
     * 429 Too Many Requests → always retry with backoff
     * 503 Service Unavailable → always retry with backoff
     * Any other error → return error immediately (no retry)
     */
    private static final int MAX_ATTEMPTS = 4;
    private static final long BASE_DELAY_MS = 2_000; // 2 seconds

    @SuppressWarnings("unchecked")
    private String executeWithBackoff(String fullUrl, HttpEntity<Map<String, Object>> entity) {
        int attempt = 0;
        while (attempt < MAX_ATTEMPTS) {
            attempt++;
            try {
                ResponseEntity<Map> response = restTemplate.postForEntity(fullUrl, entity, Map.class);
                return extractTextFromGeminiResponse(response.getBody());

            } catch (org.springframework.web.client.HttpClientErrorException e) {
                // 429 Too Many Requests — back off and retry
                if (e.getStatusCode().value() == 429) {
                    System.err.printf(
                            "[GeminiApiService] 429 Too Many Requests (attempt %d/%d). Backing off...%n",
                            attempt, MAX_ATTEMPTS);
                    sleepBackoff(attempt);
                } else {
                    // 4xx errors other than 429 are not retriable
                    return "Error calling Gemini API [" + e.getStatusCode().value() + "]: " + e.getMessage();
                }

            } catch (org.springframework.web.client.HttpServerErrorException e) {
                // 503 Service Unavailable — back off and retry
                if (e.getStatusCode().value() == 503) {
                    System.err.printf(
                            "[GeminiApiService] 503 Service Unavailable (attempt %d/%d). Backing off...%n",
                            attempt, MAX_ATTEMPTS);
                    sleepBackoff(attempt);
                } else {
                    return "Error calling Gemini API [" + e.getStatusCode().value() + "]: " + e.getMessage();
                }

            } catch (Exception e) {
                return "Error calling Gemini API: " + e.getMessage();
            }
        }
        return "Error: Gemini API unavailable after " + MAX_ATTEMPTS + " attempts (rate limit or server overload). " +
                "Try again in 60 seconds or upgrade to a paid tier.";
    }

    /**
     * Sleeps for BASE_DELAY_MS * 2^(attempt-1) milliseconds.
     * attempt 1 → 2 s, attempt 2 → 4 s, attempt 3 → 8 s
     */
    private void sleepBackoff(int attempt) {
        long delay = BASE_DELAY_MS * (1L << (attempt - 1)); // 2s, 4s, 8s
        System.err.printf("[GeminiApiService] Waiting %d ms before retry...%n", delay);
        try {
            Thread.sleep(delay);
        } catch (InterruptedException ie) {
            Thread.currentThread().interrupt();
        }
    }

    @SuppressWarnings("unchecked")
    private String extractTextFromGeminiResponse(Map responseBody) {
        if (responseBody == null)
            return "No response from Gemini";

        List candidates = (List) responseBody.get("candidates");
        if (candidates == null || candidates.isEmpty())
            return "No candidates returned";

        Map firstCandidate = (Map) candidates.get(0);
        Map content = (Map) firstCandidate.get("content");
        List parts = (List) content.get("parts");
        Map firstPart = (Map) parts.get(0);

        return (String) firstPart.get("text");
    }
}