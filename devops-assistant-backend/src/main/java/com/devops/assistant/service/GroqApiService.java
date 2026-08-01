package com.devops.assistant.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class GroqApiService {

    @Value("${groq.api.key:}")
    private String apiKey;

    @Value("${groq.api.url:https://api.groq.com/openai/v1/chat/completions}")
    private String apiUrl;

    @Value("${groq.api.model:llama-3.3-70b-versatile}")
    private String model;

    private final WebClient webClient;

    public GroqApiService(WebClient webClient) {
        this.webClient = webClient;
    }

    private static final int MAX_ATTEMPTS = 3;
    private static final long BASE_DELAY_MS = 2_000;

    public String generateContent(String prompt) {
        if (apiKey == null || apiKey.isEmpty()) {
            log.error("GROQ_API_KEY environment variable is not configured.");
            return "Error: GROQ_API_KEY environment variable is not set.";
        }

        Map<String, Object> message = Map.of("role", "user", "content", prompt);
        Map<String, Object> payload = Map.of(
                "model", model,
                "messages", List.of(message),
                "temperature", 0.0 // Ensure deterministic JSON output
        );

        return executeWithBackoff(apiUrl, payload);
    }

    @SuppressWarnings("unchecked")
    private String executeWithBackoff(String url, Map<String, Object> payload) {
        int attempt = 0;
        while (attempt < MAX_ATTEMPTS) {
            attempt++;
            try {
                Map responseBody = webClient.post()
                        .uri(url)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .bodyValue(payload)
                        .retrieve()
                        .bodyToMono(Map.class)
                        .block();

                return extractTextFromGroqResponse(responseBody);

            } catch (WebClientResponseException e) {
                int statusCode = e.getStatusCode().value();
                if (statusCode == 429) {
                    log.warn("Groq API HTTP 429 Too Many Requests (attempt {}/{}). Backing off...", attempt, MAX_ATTEMPTS);
                    sleepBackoff(attempt);
                } else if (statusCode >= 500) {
                    log.warn("Groq API HTTP {} Server Error (attempt {}/{}). Backing off...", statusCode, attempt, MAX_ATTEMPTS);
                    sleepBackoff(attempt);
                } else {
                    log.error("HTTP error from Groq API [{}]: {}", statusCode, e.getMessage());
                    return "Error calling Groq API [" + statusCode + "]: " + e.getMessage();
                }

            } catch (Exception e) {
                log.error("Unexpected error invoking Groq API: ", e);
                return "Error calling Groq API: " + e.getMessage();
            }
        }
        log.error("Groq API unavailable after {} attempts.", MAX_ATTEMPTS);
        return "Error: Groq API unavailable after " + MAX_ATTEMPTS + " attempts.";
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
    private String extractTextFromGroqResponse(Map responseBody) {
        if (responseBody == null) return "No response from Groq";

        List choices = (List) responseBody.get("choices");
        if (choices == null || choices.isEmpty()) return "No choices returned";

        Map firstChoice = (Map) choices.get(0);
        Map message = (Map) firstChoice.get("message");
        if (message == null) return "No message in response";

        return (String) message.get("content");
    }
}
