package com.portal.backend.controller;

import com.portal.backend.model.Student;
import com.portal.backend.repository.StudentRepository;
import com.portal.backend.service.ExcelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "*") // For development
public class StudentController {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private ExcelService excelService;
    
    @Autowired
    private com.portal.backend.repository.CompanyRepository companyRepository;

    @Autowired
    private com.portal.backend.service.GeminiService geminiService;

    @GetMapping
    public List<Student> getAllStudents() {
        return studentRepository.findByDeletedFalse();
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadExcel(@RequestParam("file") MultipartFile file) {
        excelService.saveStudentsFromExcel(file);
        return ResponseEntity.ok("Students uploaded and saved successfully!");
    }

    @PostMapping("/upload-resume")
    public ResponseEntity<String> uploadResume(@RequestParam("file") MultipartFile file) {
        try {
            String filename = System.currentTimeMillis() + "_" + file.getOriginalFilename().replaceAll("[^a-zA-Z0-9\\.\\-]", "_");
            Path path = Paths.get("uploads/" + filename);
            Files.createDirectories(path.getParent());
            file.transferTo(path);
            return ResponseEntity.ok("http://localhost:8080/uploads/" + filename);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error uploading file");
        }
    }

    @PostMapping("/compute-ats-bulk")
    public ResponseEntity<?> computeAtsBulk() {
        List<Student> students = studentRepository.findByDeletedFalse();
        int count = 0;
        for (Student student : students) {
            if (student.getAtsScore() == null || student.getAtsScore() == 0) {
                int score = geminiService.computeAtsScore(student);
                student.setAtsScore(score);
                studentRepository.save(student);
                count++;
            }
        }
        return ResponseEntity.ok(java.util.Map.of("message", "Computed ATS for " + count + " students."));
    }

    @PostMapping("/{id}/compute-ats")
    public ResponseEntity<?> computeAtsSingle(@PathVariable Long id) {
        return studentRepository.findById(id).map(student -> {
            int score = geminiService.computeAtsScore(student);
            student.setAtsScore(score);
            studentRepository.save(student);
            return ResponseEntity.ok(java.util.Map.of("message", "ATS Score updated successfully", "score", score));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> softDeleteStudent(@PathVariable Long id) {
        return studentRepository.findById(id).map(student -> {
            student.setDeleted(true);
            studentRepository.save(student);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Student> updateStudent(@PathVariable Long id, @RequestBody Student studentDetails) {
        return studentRepository.findById(id).map(student -> {
            student.setName(studentDetails.getName());
            student.setRegNo(studentDetails.getRegNo());
            student.setDepartment(studentDetails.getDepartment());
            if (studentDetails.getResumeDriveLink() != null) {
                student.setResumeDriveLink(studentDetails.getResumeDriveLink());
            }
            // other fields could be mapped as needed, keeping it simple for the UI
            Student updatedStudent = studentRepository.save(student);
            return ResponseEntity.ok(updatedStudent);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/place")
    public ResponseEntity<Student> placeStudent(@PathVariable Long id, @RequestBody java.util.Map<String, Object> payload) {
        return studentRepository.findById(id).map(student -> {
            if (payload.containsKey("companyId") && payload.get("companyId") != null) {
                Long companyId = Long.valueOf(payload.get("companyId").toString());
                companyRepository.findById(companyId).ifPresent(student::setPlacedCompany);
            } else {
                student.setPlacedCompany(null);
            }
            if (payload.containsKey("ctcInLpa") && payload.get("ctcInLpa") != null) {
                student.setCtcInLpa(Double.valueOf(payload.get("ctcInLpa").toString()));
            } else {
                student.setCtcInLpa(null);
            }
            Student updatedStudent = studentRepository.save(student);
            return ResponseEntity.ok(updatedStudent);
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/recycle-bin")
    public List<Student> getDeletedStudents() {
        return studentRepository.findByDeletedTrue();
    }

    @DeleteMapping("/bulk-delete")
    public ResponseEntity<?> deleteAllStudents() {
        studentRepository.deleteAll();
        return ResponseEntity.ok(java.util.Map.of("message", "All students deleted successfully"));
    }

    @GetMapping("/export")
    public ResponseEntity<String> exportStudentsToCSV(@RequestParam(required = false) Boolean placedOnly) {
        List<Student> students = studentRepository.findByDeletedFalse();
        if (placedOnly != null && placedOnly) {
            students = students.stream().filter(s -> s.getPlacedCompany() != null).toList();
        }

        StringBuilder csv = new StringBuilder();
        csv.append("ID,Name,RegNo,Department,Email,Mobile,Placed,ATS Score,Company Name,CTC (LPA)\n");
        for (Student s : students) {
            csv.append(s.getId()).append(",")
               .append(s.getName() != null ? s.getName().replace(",", "") : "").append(",")
               .append(s.getRegNo() != null ? s.getRegNo() : "").append(",")
               .append(s.getDepartment() != null ? s.getDepartment() : "").append(",")
               .append(s.getEmail() != null ? s.getEmail() : "").append(",")
               .append(s.getMobileNumber() != null ? s.getMobileNumber() : "").append(",")
               .append(s.getPlacedCompany() != null).append(",")
               .append(s.getAtsScore() != null ? s.getAtsScore() : 0).append(",")
               .append(s.getPlacedCompany() != null && s.getPlacedCompany().getName() != null ? s.getPlacedCompany().getName().replace(",", "") : "").append(",")
               .append(s.getCtcInLpa() != null ? s.getCtcInLpa() : "").append("\n");
        }

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=students.csv")
                .header("Content-Type", "text/csv")
                .body(csv.toString());
    }
}
