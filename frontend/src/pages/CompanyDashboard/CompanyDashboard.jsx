import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './CompanyDashboard.css';

const CompanyDashboard = () => {
  const { role } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [students, setStudents] = useState([]);

  const [newCompanyName, setNewCompanyName] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newCompanySize, setNewCompanySize] = useState('');
  const [newCtc, setNewCtc] = useState('');
  const [newContactPerson, setNewContactPerson] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactMobile, setNewContactMobile] = useState('');
  const [jdFile, setJdFile] = useState(null);

  useEffect(() => {
    fetchCompanies();
    fetchStudents();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/companies');
      const data = await res.json();
      setCompanies(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/students');
      const data = await res.json();
      setStudents(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleMatchClick = (company) => {
    setSelectedCompany(company);
    setShowModal(true);
  };

  const handleAddCompany = async (e) => {
    e.preventDefault();
    try {
      let uploadedJdLink = null;
      if (jdFile) {
        const formData = new FormData();
        formData.append("file", jdFile);
        const uploadRes = await fetch('http://localhost:8080/api/companies/upload-jd', {
          method: 'POST',
          body: formData
        });
        if (uploadRes.ok) {
          uploadedJdLink = await uploadRes.text();
        } else {
          console.error("Failed to upload JD");
          alert("Failed to upload JD. Proceeding without JD.");
        }
      }

      const companyData = {
        name: newCompanyName,
        location: newLocation,
        companySize: newCompanySize,
        ctcInLpa: parseFloat(newCtc) || null,
        contactPerson: newContactPerson,
        contactPersonEmail: newContactEmail,
        contactPersonMobile: newContactMobile,
        jdLink: uploadedJdLink,
        approved: false // Always false when submitted by LEAD/MANAGER here
      };

      await fetch('http://localhost:8080/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyData)
      });
      
      alert("Company added successfully and sent for approval.");
      setNewCompanyName('');
      setNewLocation('');
      setNewCompanySize('');
      setNewCtc('');
      setNewContactPerson('');
      setNewContactEmail('');
      setNewContactMobile('');
      setJdFile(null);
      fetchCompanies();
    } catch (err) {
      console.error(err);
      alert("Failed to add company.");
    }
  };

  // Compute ATS metrics
  const level1 = students.filter(s => s.atsScore >= 91 && s.atsScore <= 100).length;
  const level2 = students.filter(s => s.atsScore >= 81 && s.atsScore <= 90).length;
  const level3 = students.filter(s => s.atsScore >= 71 && s.atsScore <= 80).length;
  const level4 = students.filter(s => s.atsScore >= 61 && s.atsScore <= 70).length;

  const topStudents = students.filter(s => s.atsScore >= 91).sort((a, b) => b.atsScore - a.atsScore);

  return (
    <div className="dashboard-container">
      
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
        
        {/* Left Side: Add New Company */}
        <div style={{ flex: 1 }}>
          {(role === 'LEAD' || role === 'MANAGER' || role === 'ADMIN') && (
            <div style={{background: '#e6f0fa', padding: '1rem', borderRadius: '8px'}}>
              <h4 style={{marginTop: 0, fontSize: '1.2rem', marginBottom: '1rem'}}>Add New Company</h4>
              <form onSubmit={handleAddCompany} style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                <input type="text" placeholder="Company Name" value={newCompanyName} onChange={e => setNewCompanyName(e.target.value)} required style={{padding: '0.5rem'}} />
                <input type="text" placeholder="Location" value={newLocation} onChange={e => setNewLocation(e.target.value)} required style={{padding: '0.5rem'}} />
                <input type="text" placeholder="Company Size (e.g. 50-200)" value={newCompanySize} onChange={e => setNewCompanySize(e.target.value)} style={{padding: '0.5rem'}} />
                <input type="number" step="0.1" placeholder="CTC Offered (LPA)" value={newCtc} onChange={e => setNewCtc(e.target.value)} style={{padding: '0.5rem'}} />
                <input type="text" placeholder="Contact Person" value={newContactPerson} onChange={e => setNewContactPerson(e.target.value)} style={{padding: '0.5rem'}} />
                <input type="email" placeholder="Contact Email" value={newContactEmail} onChange={e => setNewContactEmail(e.target.value)} style={{padding: '0.5rem'}} />
                <input type="text" placeholder="Contact Mobile" value={newContactMobile} onChange={e => setNewContactMobile(e.target.value)} style={{padding: '0.5rem'}} />
                <label style={{fontSize: '0.9rem', marginBottom: '-0.2rem', color: '#555'}}>Upload JD (PDF/DOC):</label>
                <input type="file" accept=".pdf,.doc,.docx" onChange={e => setJdFile(e.target.files[0])} style={{padding: '0.5rem'}} />
                <button type="submit" className="btn-primary" style={{marginTop: '0.5rem'}}>Add Company</button>
              </form>
            </div>
          )}
        </div>

        {/* Right Side: ATS Metrics Grid */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
            <h3 style={{margin: '0 0 0.5rem 0'}}>Level 1</h3>
            <p style={{ color: 'var(--text-light)', margin: '0' }}>Score 91-100</p>
            <h2 style={{ color: '#28a745', margin: '0.5rem 0 0 0' }}>{level1}</h2>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
            <h3 style={{margin: '0 0 0.5rem 0'}}>Level 2</h3>
            <p style={{ color: 'var(--text-light)', margin: '0' }}>Score 81-90</p>
            <h2 style={{ color: '#17a2b8', margin: '0.5rem 0 0 0' }}>{level2}</h2>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
            <h3 style={{margin: '0 0 0.5rem 0'}}>Level 3</h3>
            <p style={{ color: 'var(--text-light)', margin: '0' }}>Score 71-80</p>
            <h2 style={{ color: '#ffc107', margin: '0.5rem 0 0 0' }}>{level3}</h2>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
            <h3 style={{margin: '0 0 0.5rem 0'}}>Level 4</h3>
            <p style={{ color: 'var(--text-light)', margin: '0' }}>Score 61-70</p>
            <h2 style={{ color: '#dc3545', margin: '0.5rem 0 0 0' }}>{level4}</h2>
          </div>
        </div>

      </div>

      <div style={{marginBottom: '1rem'}}>
        <h1>Company Directory & Matches</h1>
      </div>
      
      <table className="student-table">
        <thead>
          <tr>
            <th>Company Name</th>
            <th>Location</th>
            <th>Size</th>
            <th>Approval</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {companies.map(c => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.location || 'N/A'}</td>
              <td>{c.companySize || 'N/A'}</td>
              <td>
                <span className={`status-badge ${c.approved ? 'status-hot' : 'status-cold'}`}>
                  {c.approved ? 'Approved' : 'Pending'}
                </span>
              </td>
              <td>
                <button className="btn-primary" onClick={() => handleMatchClick(c)} disabled={!c.approved} style={{opacity: c.approved ? 1 : 0.5}}>
                  View Top Matches
                </button>
              </td>
            </tr>
          ))}
          {companies.length === 0 && <tr><td colSpan="5" style={{textAlign:'center'}}>No companies found.</td></tr>}
        </tbody>
      </table>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <span className="close-btn" onClick={() => setShowModal(false)}>&times;</span>
            <h2>Top Matches for {selectedCompany?.name} (ATS &gt; 90)</h2>
            <div className="match-list">
              {topStudents.map(ts => (
                <div key={ts.id} className="match-card">
                  <div className="match-avatar">{ts.name.charAt(0)}</div>
                  <div className="match-info">
                    <h4>{ts.name}</h4>
                    <p style={{margin: '0.25rem 0', color: 'var(--text-light)'}}>{ts.department}</p>
                    <span className="badge badge-green">Score: {ts.atsScore}</span>
                  </div>
                </div>
              ))}
              {topStudents.length === 0 && <p style={{color: 'var(--text-light)', marginTop: '1rem'}}>No students found with ATS score &gt; 90.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDashboard;
