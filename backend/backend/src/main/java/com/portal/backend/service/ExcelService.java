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
                if (rowNumber < 3) { // Skip first 3 rows (title, empty, headers)
                    rowNumber++;
                    continue; 
                }

                String regNo = getStringVal(currentRow.getCell(1));
                if (regNo == null || regNo.trim().isEmpty()) {
                    continue; // Skip empty regNo
                }

                Student student = existingRegNoMap.get(regNo);
                if (student == null) {
                    student = new Student();
                }
                
                existingRegNoMap.put(regNo, student); // Add to map to prevent duplicates within the same excel file

                student.setName(getStringVal(currentRow.getCell(0)));
                student.setRegNo(regNo);
                student.setDepartment(getStringVal(currentRow.getCell(2)));
                student.setGender(getStringVal(currentRow.getCell(3)));
                student.setEmail(getStringVal(currentRow.getCell(4)));
                student.setResidentType(getStringVal(currentRow.getCell(5)));
                
                student.setSslcPercentage(getNumericVal(currentRow.getCell(6)));
                Double sslcYear = getNumericVal(currentRow.getCell(7));
                if(sslcYear != null) student.setSslcYear(sslcYear.intValue());
                
                student.setHscPercentage(getNumericVal(currentRow.getCell(8)));
                Double hscYear = getNumericVal(currentRow.getCell(9));
                if(hscYear != null) student.setHscYear(hscYear.intValue());
                
                student.setUgPercentage(getNumericVal(currentRow.getCell(10)));
                Double ugYear = getNumericVal(currentRow.getCell(11));
                if(ugYear != null) student.setUgYear(ugYear.intValue());
                
                student.setPgPercentage(getNumericVal(currentRow.getCell(12)));
                Double pgYear = getNumericVal(currentRow.getCell(13));
                if(pgYear != null) student.setPgYear(pgYear.intValue());
                
                Double gradYear = getNumericVal(currentRow.getCell(14));
                if(gradYear != null) student.setGraduationYear(gradYear.intValue());
                
                student.setGithubId(getStringVal(currentRow.getCell(15)));
                student.setLinkedinUrl(getStringVal(currentRow.getCell(16)));
                student.setResumeDriveLink(getStringVal(currentRow.getCell(17)));
                student.setSelfIntroDriveLink(getStringVal(currentRow.getCell(18)));
                student.setPhotoDriveLink(getStringVal(currentRow.getCell(19)));
                student.setPortfolio(getStringVal(currentRow.getCell(20)));
                student.setMobileNumber(getStringVal(currentRow.getCell(21)));

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
                if (rowNumber < 3) { // Skip first 3 rows (title, empty, headers)
                    rowNumber++;
                    continue;
                }

                String companyName = getStringVal(currentRow.getCell(1));
                if (companyName == null || companyName.trim().isEmpty()) {
                    continue;
                }

                Company company = new Company();
                company.setName(companyName);
                company.setRole(getStringVal(currentRow.getCell(2)));
                
                Double ctc = getNumericVal(currentRow.getCell(3));
                if (ctc != null) company.setCtcInLpa(ctc);

                company.setLocation(getStringVal(currentRow.getCell(4)));
                
                // Ignore indices 5, 6, 7, 8 as requested
                
                company.setJdSummary(getStringVal(currentRow.getCell(9)));
                company.setJdLink(getStringVal(currentRow.getCell(10)));
                company.setCareersLink(getStringVal(currentRow.getCell(11)));
                company.setContactPersonEmail(getStringVal(currentRow.getCell(12)));
                company.setContactPersonMobile(getStringVal(currentRow.getCell(13)));
                
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
