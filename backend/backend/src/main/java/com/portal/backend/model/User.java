package com.portal.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role; // ADMIN, MANAGER, LEAD, STUDENT

    @Column(nullable = false, name = "is_deleted")
    private Boolean deleted = false; // Soft-delete flag

    public enum Role {
        ADMIN, MANAGER, LEAD, STUDENT
    }
}
