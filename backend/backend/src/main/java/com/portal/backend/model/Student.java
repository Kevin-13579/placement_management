package com.portal.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "students")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String regNo;
    private String department;
    private String gender;
    private String residentType; // hostler/dayscholar

    private Double sslcPercentage;
    private Integer sslcYear;

    private Double hscPercentage;
    private Integer hscYear;

    private Double ugPercentage;
    private Integer ugYear;

    private Double pgPercentage;
    private Integer pgYear;

    private Integer graduationYear;

    private String githubId;
    private String linkedinUrl;
    private String resumeDriveLink;
    private String selfIntroDriveLink;
    private String photoDriveLink;
    private String portfolio;

    private String email;
    private String mobileNumber;
    
    private Integer atsScore;

    @Column(nullable = false, name = "is_deleted")
    private Boolean deleted = false; // Soft-delete flag
    
    private Double ctcInLpa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "placed_company_id")
    private Company placedCompany;
}
