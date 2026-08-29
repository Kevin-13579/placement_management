package com.portal.backend.service;

import com.portal.backend.model.Student;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.io.InputStream;
import java.net.URL;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public int computeAtsScore(Student student) {
        try {
            String resumeText = "Resume link: " + student.getResumeDriveLink();
            
            // Try to extract text if it's a drive link or local upload
            if (student.getResumeDriveLink() != null) {
                String link = student.getResumeDriveLink();
                String extracted = null;
                if (link.contains("drive.google.com")) {
                    extracted = downloadAndParsePdf(link);
                } else if (link.contains("localhost:8080/uploads/")) {
                    String filename = link.substring(link.lastIndexOf("/") + 1);
                    try (PDDocument document = org.apache.pdfbox.Loader.loadPDF(new java.io.File("uploads/" + filename))) {
                        PDFTextStripper stripper = new PDFTextStripper();
                        extracted = stripper.getText(document);
                    } catch (Exception e) {
                        System.err.println("Failed to read local PDF: " + e.getMessage());
                    }
                }
                
                if (extracted != null && !extracted.trim().isEmpty()) {
                    resumeText = "Resume Extracted Text:\n" + extracted;
                }
            }

            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;

            String prompt = String.format("Analyze the following student profile and resume, and provide an ATS score from 1 to 100 based on their academic performance, skills, and overall profile strength. ONLY return the integer number, nothing else.\n\nName: %s\nDepartment: %s\nUG Percentage: %s\nHSC Percentage: %s\nSSLC Percentage: %s\n\n%s", 
                student.getName(), student.getDepartment(), student.getUgPercentage(), student.getHscPercentage(), student.getSslcPercentage(), resumeText);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", List.of(
                Map.of("parts", List.of(
                    Map.of("text", prompt)
                ))
            ));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) body.get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                    if (parts != null && !parts.isEmpty()) {
                        String text = (String) parts.get(0).get("text");
                        return Integer.parseInt(text.trim().replaceAll("[^0-9]", ""));
                    }
                }
            }
            
            return 0; // Default if API fails
        } catch (Exception e) {
            System.err.println("Failed to compute ATS for student " + student.getId() + ": " + e.getMessage());
            return 0;
        }
    }

    private String downloadAndParsePdf(String driveUrl) {
        try {
            String fileId = extractFileIdFromDriveLink(driveUrl);
            if (fileId == null) return null;

            String downloadUrl = "https://drive.google.com/uc?export=download&id=" + fileId;
            
            try (InputStream in = new URL(downloadUrl).openStream();
                 PDDocument document = org.apache.pdfbox.Loader.loadPDF(in.readAllBytes())) {
                PDFTextStripper stripper = new PDFTextStripper();
                return stripper.getText(document);
            }
        } catch (Exception e) {
            System.err.println("Failed to download or parse PDF: " + e.getMessage());
            return null;
        }
    }

    private String extractFileIdFromDriveLink(String driveUrl) {
        Pattern pattern = Pattern.compile("/d/([a-zA-Z0-9_-]+)");
        Matcher matcher = pattern.matcher(driveUrl);
        if (matcher.find()) {
            return matcher.group(1);
        }
        
        pattern = Pattern.compile("id=([a-zA-Z0-9_-]+)");
        matcher = pattern.matcher(driveUrl);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return null;
    }
}
