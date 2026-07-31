package com.devops.assistant.controller;

import com.devops.assistant.dto.AnalysisRequest;
import com.devops.assistant.repository.ProjectAnalysisRepository;
import com.devops.assistant.service.DevOpsGeneratorService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = {AnalysisController.class, HealthController.class})
class AnalysisControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private DevOpsGeneratorService generatorService;

    @MockBean
    private ProjectAnalysisRepository repository;

    @Test
    @DisplayName("GET /api/health should return 200 OK")
    void testHealthEndpoint() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(content().string("OK"));
    }

    @Test
    @DisplayName("POST /api/v1/analysis should validate empty request body")
    void testEmptyAnalysisRequest() throws Exception {
        AnalysisRequest request = new AnalysisRequest();

        mockMvc.perform(post("/api/v1/analysis")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().is4xxClientError());
    }
}
