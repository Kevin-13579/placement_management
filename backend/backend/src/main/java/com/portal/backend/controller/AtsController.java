package com.portal.backend.controller;

import com.portal.backend.model.Student;
import com.portal.backend.repository.StudentRepository;
import com.portal.backend.service.GeminiAtsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/ats")
@CrossOrigin(origins = "*") // For development
public class AtsController {

    @Autowired
    private GeminiAtsService geminiAtsService;

    @Autowired
    private StudentRepository studentRepository;

    @PostMapping("/calculate/{studentId}")
    public ResponseEntity<?> calculateAtsForStudent(@PathVariable Long studentId, @RequestBody Map<String, String> payload) {
        String jobDescription = payload.get("jobDescription");
        
        Optional<Student> studentOpt = studentRepository.findById(studentId);
        if (studentOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Student student = studentOpt.get();
        // In a real app we'd fetch the resume text from drive using student.getResumeDriveLink()
        String mockResumeText = "Mock resume text for " + student.getName();

        int atsScore = geminiAtsService.calculateAtsScore(mockResumeText, jobDescription);
        student.setAtsScore(atsScore);
        studentRepository.save(student);

        return ResponseEntity.ok(Map.of(
                "studentId", student.getId(),
                "atsScore", atsScore
        ));
    }
}
