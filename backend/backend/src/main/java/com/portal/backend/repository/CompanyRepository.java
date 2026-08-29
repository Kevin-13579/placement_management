package com.portal.backend.repository;

import com.portal.backend.model.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {
    List<Company> findByDeletedFalse();
    List<Company> findByStatusAndDeletedFalse(Company.Status status);
}
