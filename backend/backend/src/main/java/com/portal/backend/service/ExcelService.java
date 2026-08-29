package com.portal.backend.service;

import com.portal.backend.model.Student;
import com.portal.backend.repository.StudentRepository;
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
    private GeminiAtsService geminiAtsService;

    public void saveStudentsFromExcel(MultipartFile file) {
        try {
            InputStream is = file.getInputStream();
            Workbook workbook = WorkbookFactory.create(is);
            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rows = sheet.iterator();

            List<Student> existingStudents = studentRepository.findAll();
            java.util.Set<String> existingRegNos = existingStudents.stream()
                .map(Student::getRegNo)
                .filter(java.util.Objects::nonNull)
                .collect(java.util.stream.Collectors.toSet());

            List<Student> students = new ArrayList<>();
            int rowNumber = 0;

            while (rows.hasNext()) {
                Row currentRow = rows.next();
                if (rowNumber == 0) {
                    rowNumber++;
                    continue; // Skip header
                }

                String regNo = getStringVal(currentRow.getCell(1));
                if (regNo == null || existingRegNos.contains(regNo)) {
                    continue; // Skip duplicates or empty regNo
                }
                existingRegNos.add(regNo); // Add to set to prevent duplicates within the same excel file

                Student student = new Student();
                
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

                // Calculate and set Mock ATS Score
                int mockAtsScore = geminiAtsService.calculateAtsScore(student.getResumeDriveLink(), "Default Job Description");
                student.setAtsScore(mockAtsScore);

                students.add(student);
            }
            workbook.close();
            studentRepository.saveAll(students);
        } catch (Exception e) {
            throw new RuntimeException("Failed to store excel data: " + e.getMessage());
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
