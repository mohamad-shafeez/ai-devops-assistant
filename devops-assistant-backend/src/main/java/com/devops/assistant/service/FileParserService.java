package com.devops.assistant.service;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FileParserService {

    public String parseFiles(List<String> files) {
        if (files == null || files.isEmpty()) {
            return "";
        }
        return files.stream()
                .collect(Collectors.joining("\n\n"));
    }
}
