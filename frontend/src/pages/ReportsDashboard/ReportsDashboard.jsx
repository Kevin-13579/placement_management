import React, { useState, useEffect } from 'react';
import './ReportsDashboard.css';

const ReportsDashboard = () => {
  const [students, setStudents] = useState([]);
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentRes, companyRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL || 'https://YOUR_RENDER_APP_NAME.onrender.com'}/api/students`),
          fetch(`${import.meta.env.VITE_API_URL || 'https://YOUR_RENDER_APP_NAME.onrender.com'}/api/companies`)
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

  const [selectedCompanyId, setSelectedCompanyId] = useState('');

  const totalStudents = students.length;
  const placedStudents = students.filter(s => s.placedCompany != null).length;
  const unplacedStudents = totalStudents - placedStudents;
  const successRatio = totalStudents === 0 ? 0 : Math.round((placedStudents / totalStudents) * 100);

  const coldCount = companies.filter(c => c.status === 'COLD').length;
  const warmCount = companies.filter(c => c.status === 'WARM').length;
  const hotCount = companies.filter(c => c.status === 'HOT').length;
  const completedCount = companies.filter(c => c.status === 'DRIVE_COMPLETED').length;
  const totalCandidatesPlacedInCompletedDrives = companies
    .filter(c => c.status === 'DRIVE_COMPLETED')
    .reduce((sum, c) => sum + (c.candidatesPlaced || 0), 0);

  const handleExportAll = () => {
    window.open(`${import.meta.env.VITE_API_URL || 'https://YOUR_RENDER_APP_NAME.onrender.com'}/api/students/export`, '_blank');
  };

  const handleExportPlaced = () => {
    window.open(`${import.meta.env.VITE_API_URL || 'https://YOUR_RENDER_APP_NAME.onrender.com'}/api/students/export?placedOnly=true`, '_blank');
  };

  const studentsInSelectedCompany = students.filter(
    s => s.placedCompany && s.placedCompany.id.toString() === selectedCompanyId
  );

  const selectedCompanyObj = companies.find(c => c.id.toString() === selectedCompanyId);

  return (
    <div className="dashboard-container">
      <h1>Analytics & Reports</h1>
      
      <div className="reports-grid" style={{ gap: '2rem', marginBottom: '2rem' }}>
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
            <li><strong>Completed:</strong> {completedCount} Drives ({totalCandidatesPlacedInCompletedDrives} Placed)</li>
          </ul>
        </div>
      </div>

      <div className="card" style={{marginTop: '2rem', marginBottom: '2rem'}}>
        <h2>Company Placements</h2>
        <div style={{ marginBottom: '1rem' }}>
          <select 
            value={selectedCompanyId} 
            onChange={(e) => setSelectedCompanyId(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', width: '100%', maxWidth: '300px' }}
          >
            <option value="">-- Select a Company --</option>
            {companies.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        {selectedCompanyId && (
          <div style={{maxHeight: '400px', overflowY: 'auto'}}>
            {selectedCompanyObj && selectedCompanyObj.status === 'DRIVE_COMPLETED' && (
              <div style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(23, 162, 184, 0.1)', borderRadius: '8px', borderLeft: '4px solid #17a2b8' }}>
                <h4 style={{ margin: 0, color: '#17a2b8' }}>Drive Completed</h4>
                <p style={{ margin: '0.5rem 0 0 0' }}>Total Candidates Placed (as reported): <strong>{selectedCompanyObj.candidatesPlaced || 0}</strong></p>
              </div>
            )}
            <table className="data-table">
              <thead>
                <tr>
                  <th>Reg No</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>ATS Score</th>
                  <th>CTC Offered</th>
                </tr>
              </thead>
              <tbody>
                {studentsInSelectedCompany.map(s => (
                  <tr key={s.id}>
                    <td>{s.regNo}</td>
                    <td>{s.name}</td>
                    <td>{s.department}</td>
                    <td>{s.atsScore || 'N/A'}</td>
                    <td>{s.ctcInLpa ? `${s.ctcInLpa} LPA` : 'N/A'}</td>
                  </tr>
                ))}
                {studentsInSelectedCompany.length === 0 && <tr><td colSpan="5" style={{textAlign:'center'}}>No students placed in this company yet.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card" style={{marginTop: '2rem', marginBottom: '2rem'}}>
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
