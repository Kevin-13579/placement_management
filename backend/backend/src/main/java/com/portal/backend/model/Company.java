package com.portal.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "companies")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String location;
    private String website;
    
    private String contactPerson;
    private String contactPersonMobile;
    private String contactPersonEmail;
    
    private String companySize;
    
    @Enumerated(EnumType.STRING)
    private Status status; // COLD, WARM, HOT, DRIVE_COMPLETED
    
    private String jdLink;
    @Column(columnDefinition="TEXT")
    private String jdSummary;
    private String careersLink;
    private String role;
    
    private Double ctcInLpa;
    private Integer candidatesPlaced;
    
    @Column(name = "is_approved")
    private Boolean approved = false;
    
    @Column(nullable = false, name = "is_deleted")
    private Boolean deleted = false;
    
    @CreationTimestamp
    private LocalDateTime createdAt;

    public enum Status {
        COLD, WARM, HOT, DRIVE_COMPLETED
    }
}
