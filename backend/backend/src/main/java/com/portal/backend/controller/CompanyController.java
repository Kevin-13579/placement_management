package com.portal.backend.controller;

import com.portal.backend.model.Company;
import com.portal.backend.repository.CompanyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/companies")
@CrossOrigin(origins = "*") // For development
public class CompanyController {

    @Autowired
    private CompanyRepository companyRepository;

    @GetMapping
    public List<Company> getAllCompanies() {
        return companyRepository.findByDeletedFalse();
    }

    @PostMapping("/upload-jd")
    public ResponseEntity<String> uploadJd(@RequestParam("file") MultipartFile file) {
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

    @PostMapping
    public Company createCompany(@RequestBody Company company) {
        if (company.getStatus() == null) {
            company.setStatus(Company.Status.COLD);
        }
        if (company.getDeleted() == null) {
            company.setDeleted(false);
        }
        if (company.getApproved() == null) {
            company.setApproved(false);
        }
        return companyRepository.save(company);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Company> updateCompany(@PathVariable Long id, @RequestBody Company updatedCompany) {
        return companyRepository.findById(id).map(company -> {
            if (updatedCompany.getName() != null) company.setName(updatedCompany.getName());
            if (updatedCompany.getLocation() != null) company.setLocation(updatedCompany.getLocation());
            if (updatedCompany.getWebsite() != null) company.setWebsite(updatedCompany.getWebsite());
            if (updatedCompany.getCompanySize() != null) company.setCompanySize(updatedCompany.getCompanySize());
            if (updatedCompany.getJdLink() != null) company.setJdLink(updatedCompany.getJdLink());
            if (updatedCompany.getCtcInLpa() != null) company.setCtcInLpa(updatedCompany.getCtcInLpa());
            if (updatedCompany.getStatus() != null) company.setStatus(updatedCompany.getStatus());
            if (updatedCompany.getContactPerson() != null) company.setContactPerson(updatedCompany.getContactPerson());
            if (updatedCompany.getContactPersonEmail() != null) company.setContactPersonEmail(updatedCompany.getContactPersonEmail());
            if (updatedCompany.getContactPersonMobile() != null) company.setContactPersonMobile(updatedCompany.getContactPersonMobile());
            return ResponseEntity.ok(companyRepository.save(company));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Company> updateStatus(@PathVariable Long id, @RequestParam Company.Status status) {
        return companyRepository.findById(id).map(company -> {
            company.setStatus(status);
            return ResponseEntity.ok(companyRepository.save(company));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<Company> approveCompany(@PathVariable Long id) {
        Optional<Company> companyOpt = companyRepository.findById(id);
        if (companyOpt.isPresent()) {
            Company company = companyOpt.get();
            company.setApproved(true);
            return ResponseEntity.ok(companyRepository.save(company));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> softDeleteCompany(@PathVariable Long id) {
        return companyRepository.findById(id).map(company -> {
            company.setDeleted(true);
            companyRepository.save(company);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
