package com.portal.backend.repository;

import com.portal.backend.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    List<Student> findByDeletedFalse();
    List<Student> findByDeletedTrue();
    List<Student> findByDepartmentAndDeletedFalse(String department);
    List<Student> findByPlacedCompanyIsNotNullAndDeletedFalse();
    List<Student> findByPlacedCompanyIsNullAndDeletedFalse();
}
