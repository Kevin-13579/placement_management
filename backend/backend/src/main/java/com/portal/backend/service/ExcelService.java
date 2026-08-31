package com.portal.backend.service;

import com.portal.backend.model.Student;
import com.portal.backend.model.Company;
import com.portal.backend.repository.StudentRepository;
import com.portal.backend.repository.CompanyRepository;
import org.apache.poi.ss.usermodel.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

@Service
public class ExcelService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private GeminiAtsService geminiAtsService;

    public void saveStudentsFromExcel(MultipartFile file) {
        try {
            InputStream is = file.getInputStream();
            Workbook workbook = WorkbookFactory.create(is);
            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rows = sheet.iterator();

            List<Student> existingStudents = studentRepository.findAll();
            java.util.Map<String, Student> existingRegNoMap = existingStudents.stream()
                .filter(s -> s.getRegNo() != null)
                .collect(java.util.stream.Collectors.toMap(Student::getRegNo, s -> s, (s1, s2) -> s1));

            List<Student> students = new ArrayList<>();
            int rowNumber = 0;

            while (rows.hasNext()) {
                Row currentRow = rows.next();
                
                String regNo = getStringVal(currentRow.getCell(0)); // 1. Roll no
                String name = getStringVal(currentRow.getCell(1)); // 2. name

                if (regNo == null || regNo.trim().isEmpty()) {
                    continue; // Skip empty regNo
                }

                // Header detection heuristic
                if (regNo.toLowerCase().contains("reg") || regNo.toLowerCase().contains("roll") || (name != null && name.toLowerCase().contains("name"))) {
                    continue;
                }

                Student student = existingRegNoMap.get(regNo);
                if (student == null) {
                    student = new Student();
                }
                
                existingRegNoMap.put(regNo, student); // Add to map to prevent duplicates within the same excel file

                student.setRegNo(regNo); // 1. Roll no
                student.setName(name); // 2. name
                student.setDepartment(getStringVal(currentRow.getCell(2))); // 3. department
                student.setGender(getStringVal(currentRow.getCell(3))); // 4. gender
                student.setResidentType(getStringVal(currentRow.getCell(4))); // 5. Residential
                
                student.setSslcPercentage(getNumericVal(currentRow.getCell(5))); // 6. sslc%
                student.setHscPercentage(getNumericVal(currentRow.getCell(6))); // 7. HSC %
                student.setUgPercentage(getNumericVal(currentRow.getCell(7))); // 8. UG%
                student.setPgPercentage(getNumericVal(currentRow.getCell(8))); // 9. PG %
                
                student.setGithubId(getStringVal(currentRow.getCell(9))); // 10. github id
                student.setResumeDriveLink(getStringVal(currentRow.getCell(10))); // 11. resume link
                student.setLinkedinUrl(getStringVal(currentRow.getCell(11))); // 12. linkedin id
                
                Double gradYear = getNumericVal(currentRow.getCell(12)); // 13. graduation date
                if(gradYear != null) student.setGraduationYear(gradYear.intValue());
                
                student.setPortfolio(getStringVal(currentRow.getCell(13))); // 14. portfolio link
                student.setEmail(getStringVal(currentRow.getCell(14))); // 15. personal email id
                
                // index 15 is official mail id, ignoring it since only one email is supported in Student model
                
                student.setMobileNumber(getStringVal(currentRow.getCell(16))); // 17. mobile number
                student.setPhotoDriveLink(getStringVal(currentRow.getCell(17))); // 18. student photo
                
                // Clear fields not present in new Excel format to prevent keeping old stale data on update
                student.setSslcYear(null);
                student.setHscYear(null);
                student.setUgYear(null);
                student.setPgYear(null);
                student.setSelfIntroDriveLink(null);

                // Calculate and set Mock ATS Score only if not already set or if it's a new student
                if (student.getAtsScore() == null || student.getAtsScore() == 0) {
                    int mockAtsScore = geminiAtsService.calculateAtsScore(student.getResumeDriveLink(), "Default Job Description");
                    student.setAtsScore(mockAtsScore);
                }

                students.add(student);
            }
            workbook.close();
            studentRepository.saveAll(students);
        } catch (Exception e) {
            throw new RuntimeException("Failed to store excel data: " + e.getMessage());
        }
    }

    public void saveCompaniesFromExcel(MultipartFile file) {
        try {
            InputStream is = file.getInputStream();
            Workbook workbook = WorkbookFactory.create(is);
            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rows = sheet.iterator();

            List<Company> companies = new ArrayList<>();
            int rowNumber = 0;

            while (rows.hasNext()) {
                Row currentRow = rows.next();

                String companyName = getStringVal(currentRow.getCell(1)); // 2. company name
                if (companyName == null || companyName.trim().isEmpty()) {
                    continue;
                }

                // Header detection heuristic
                if (companyName.toLowerCase().contains("company") || companyName.toLowerCase().contains("name")) {
                    continue;
                }

                Company company = new Company();
                company.setName(companyName); // 2. company name
                company.setRole(getStringVal(currentRow.getCell(2))); // 3. Job role
                
                Double ctc = getNumericVal(currentRow.getCell(3)); // 4. CTC
                if (ctc != null) company.setCtcInLpa(ctc);

                company.setLocation(getStringVal(currentRow.getCell(4))); // 5. Location
                
                // Ignore indices 5, 6, 7, 8 as requested
                
                company.setJdSummary(getStringVal(currentRow.getCell(9))); // 10. job description summaty
                company.setJdLink(getStringVal(currentRow.getCell(10))); // 11. jd pdf link
                company.setCareersLink(getStringVal(currentRow.getCell(11))); // 12. official careers link
                company.setContactPersonEmail(getStringVal(currentRow.getCell(12))); // 13. contact email
                company.setContactPersonMobile(getStringVal(currentRow.getCell(13))); // 14. contact mobile
                company.setContactPerson(getStringVal(currentRow.getCell(14))); // 15. contact person name
                
                // Set defaults
                company.setStatus(Company.Status.COLD);
                company.setApproved(true); // Assuming bulk import means they are approved

                companies.add(company);
            }
            workbook.close();
            companyRepository.saveAll(companies);
        } catch (Exception e) {
            throw new RuntimeException("Failed to store company excel data: " + e.getMessage());
        }
    }

    private String getStringVal(Cell cell) {
        if (cell == null) return null;
        if (cell.getCellType() == CellType.STRING) return cell.getStringCellValue();
        if (cell.getCellType() == CellType.NUMERIC) return String.valueOf((long) cell.getNumericCellValue());
        return null;
    }

    private Double getNumericVal(Cell cell) {
        if (cell == null) return null;
        if (cell.getCellType() == CellType.NUMERIC) return cell.getNumericCellValue();
        if (cell.getCellType() == CellType.STRING) {
            try {
                return Double.parseDouble(cell.getStringCellValue());
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }
}
