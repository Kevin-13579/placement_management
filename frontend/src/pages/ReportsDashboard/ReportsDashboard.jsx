import React, { useState, useEffect } from 'react';
import './ReportsDashboard.css';

const ReportsDashboard = () => {
  const [students, setStudents] = useState([]);
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentRes, companyRes] = await Promise.all([
          fetch('http://localhost:8080/api/students'),
          fetch('http://localhost:8080/api/companies')
        ]);
        const studentData = await studentRes.json();
        const companyData = await companyRes.json();
        setStudents(studentData);
        setCompanies(companyData);
      } catch (e) {
        console.error("Error fetching data:", e);
      }
    };
    fetchData();
  }, []);

  const totalStudents = students.length;
  const placedStudents = students.filter(s => s.placedCompany != null).length;
  const unplacedStudents = totalStudents - placedStudents;
  const successRatio = totalStudents === 0 ? 0 : Math.round((placedStudents / totalStudents) * 100);

  const coldCount = companies.filter(c => c.status === 'COLD').length;
  const warmCount = companies.filter(c => c.status === 'WARM').length;
  const hotCount = companies.filter(c => c.status === 'HOT').length;
  const completedCount = companies.filter(c => c.status === 'DRIVE_COMPLETED').length;

  const handleExportAll = () => {
    window.open('http://localhost:8080/api/students/export', '_blank');
  };

  const handleExportPlaced = () => {
    window.open('http://localhost:8080/api/students/export?placedOnly=true', '_blank');
  };

  return (
    <div className="dashboard-container">
      <h1>Analytics & Reports</h1>
      
      <div className="reports-grid">
        <div className="chart-placeholder">
          <h3>Placement Success Rate</h3>
          <div className="mock-pie-chart" style={{
            background: `conic-gradient(var(--primary-color) 0% ${successRatio}%, #ccc ${successRatio}% 100%)`
          }}></div>
          <p style={{fontSize: '1.5rem', fontWeight: 'bold'}}>{successRatio}% Placed</p>
          <div style={{display:'flex', justifyContent:'space-around', marginTop:'1rem'}}>
            <div><strong>{placedStudents}</strong><br/>Placed</div>
            <div><strong>{unplacedStudents}</strong><br/>Unplaced</div>
          </div>
        </div>
        
        <div className="chart-placeholder">
          <h3>Company Funnel</h3>
          <ul className="mock-funnel">
            <li><strong>Cold:</strong> {coldCount}</li>
            <li><strong>Warm:</strong> {warmCount}</li>
            <li><strong>Hot:</strong> {hotCount}</li>
            <li><strong>Completed:</strong> {completedCount}</li>
          </ul>
        </div>
      </div>

      <div className="card" style={{marginTop: '2rem'}}>
        <h2>Students Overview</h2>
        <div style={{maxHeight: '400px', overflowY: 'auto'}}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Reg No</th>
                <th>Name</th>
                <th>Department</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s.id}>
                  <td>{s.regNo}</td>
                  <td>{s.name}</td>
                  <td>{s.department}</td>
                  <td><span className={`status-badge ${s.placedCompany ? 'status-hot' : 'status-cold'}`}>{s.placedCompany ? 'Placed' : 'Searching'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="export-section">
        <h3>Export Data</h3>
        <p>Download filtered reports for placement analysis.</p>
        <button className="btn-primary" onClick={handleExportAll}>Download Entire Student List</button>
        <button className="btn-primary" style={{marginLeft: '1rem', backgroundColor: '#28a745'}} onClick={handleExportPlaced}>Download Placed Students List</button>
      </div>
    </div>
  );
};

export default ReportsDashboard;
