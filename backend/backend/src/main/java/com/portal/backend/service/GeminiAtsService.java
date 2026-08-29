package com.portal.backend.service;

import org.springframework.stereotype.Service;

import java.util.Random;

@Service
public class GeminiAtsService {

    // Mock API call to Gemini
    public int calculateAtsScore(String resumeText, String jobDescription) {
        // Here we would call the Gemini API
        // For now, return a mock random score between 60 and 100
        return new Random().nextInt(41) + 60;
    }
}
