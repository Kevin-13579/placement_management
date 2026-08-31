import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const { role, user } = useAuth();
  const [students, setStudents] = useState([]);
  const [file, setFile] = useState(null);

  const [viewStudent, setViewStudent] = useState(null);
  
  // Placement Workflow State
  const [companies, setCompanies] = useState([]);
  const [placeStudentData, setPlaceStudentData] = useState(null); // holds student id when placing
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [ctcInput, setCtcInput] = useState('');
  const [companySearch, setCompanySearch] = useState('');

  useEffect(() => {
    fetchStudents();
    fetchCompanies();
  }, []);

  const fetchCompanies = () => {
    axios.get(`${import.meta.env.VITE_API_URL || 'https://YOUR_RENDER_APP_NAME.onrender.com'}/api/companies`)
      .then(res => setCompanies(res.data.filter(c => c.approved)))
      .catch(err => console.error(err));
  };

  const fetchStudents = () => {
    axios.get(`${import.meta.env.VITE_API_URL || 'https://YOUR_RENDER_APP_NAME.onrender.com'}/api/students`)
      .then(response => setStudents(response.data))
      .catch(error => console.error("Error fetching students:", error));
  };

  const [filterName, setFilterName] = useState('');
  const [filterRegNo, setFilterRegNo] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  
  let filteredStudents = students.filter(s => {
    return (!filterName || s.name.toLowerCase().includes(filterName.toLowerCase())) &&
           (!filterRegNo || s.regNo.toLowerCase().includes(filterRegNo.toLowerCase())) &&
           (!filterDept || s.department === filterDept);
  });

  if (role === 'STUDENT' && user) {
    filteredStudents = filteredStudents.filter(s => s.id === user.id);
  }

  filteredStudents.sort((a, b) => {
    if (sortConfig.key) {
      let aVal = a[sortConfig.key] || '';
      let bVal = b[sortConfig.key] || '';
      if (typeof aVal === 'string') {
        return sortConfig.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
    }
    return 0;
  });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const totalPlaced = students.filter(s => s.placedCompany != null).length;
  const totalUnplaced = students.length - totalPlaced;

  const [computingAtsId, setComputingAtsId] = useState(null);

  const handleComputeSingleAts = async (id) => {
    setComputingAtsId(id);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'https://YOUR_RENDER_APP_NAME.onrender.com'}/api/students/${id}/compute-ats`);
      alert(res.data.message);
      setStudents(students.map(s => s.id === id ? { ...s, atsScore: res.data.score } : s));
    } catch (err) {
      console.error(err);
      alert('Failed to compute ATS Score');
    } finally {
      setComputingAtsId(null);
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm("Are you sure you want to delete this student?")) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL || 'https://YOUR_RENDER_APP_NAME.onrender.com'}/api/students/${id}`);
        setStudents(students.filter(s => s.id !== id));
      } catch (err) {
        console.error("Delete failed", err);
      }
    }
  };

  const handleEditClick = (student) => {
    setEditingId(student.id);
    setEditFormData({ ...student, placed: student.placedCompany != null });
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleResumeUpload = async (e, id) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'https://YOUR_RENDER_APP_NAME.onrender.com'}/api/students/upload-resume`, formData);
      // The backend returns the URL in res.data
      setEditFormData({ ...editFormData, resumeDriveLink: res.data });
      alert("Resume uploaded successfully! Click Save to apply.");
    } catch (err) {
      console.error(err);
      alert("Failed to upload resume.");
    }
  };

  const handleEditSave = async (id) => {
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL || 'https://YOUR_RENDER_APP_NAME.onrender.com'}/api/students/${id}`, editFormData);
      setStudents(students.map(s => s.id === id ? res.data : s));
      setEditingId(null);
    } catch (err) {
      console.error("Edit failed", err);
    }
  };

  const handlePlaceStudent = async (e) => {
    e.preventDefault();
    if (!selectedCompanyId) {
      alert("Please select a company");
      return;
    }
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL || 'https://YOUR_RENDER_APP_NAME.onrender.com'}/api/students/${placeStudentData.id}/place`, {
        companyId: selectedCompanyId,
        ctcInLpa: parseFloat(ctcInput) || null
      });
      setStudents(students.map(s => s.id === placeStudentData.id ? res.data : s));
      setPlaceStudentData(null);
      setSelectedCompanyId('');
      setCtcInput('');
      setCompanySearch('');
    } catch (err) {
      console.error("Placement failed", err);
    }
  };

  const filteredCompaniesForSearch = companies.filter(c => 
    c.name.toLowerCase().includes(companySearch.toLowerCase())
  );

  return (
    <div className="dashboard-container">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h1>Student Directory</h1>
      </div>
      
      <div className="stats-abstract">
        <div className="stat-card glass-panel">Total Students: {students.length}</div>
        <div className="stat-card glass-panel">Placed: {totalPlaced}</div>
        <div className="stat-card glass-panel">YTBS: {totalUnplaced}</div>
      </div>

      {role !== 'STUDENT' && (
        <div className="filters-section" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <input 
            type="text" 
            placeholder="Filter by Name" 
            value={filterName} 
            onChange={e => setFilterName(e.target.value)} 
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <input 
            type="text" 
            placeholder="Filter by Reg No" 
            value={filterRegNo} 
            onChange={e => setFilterRegNo(e.target.value)} 
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}>
            <option value="">All Departments</option>
            <option value="CSE">CSE</option>
            <option value="ECE">ECE</option>
            <option value="MECH">MECH</option>
            <option value="IT">IT</option>
          </select>
        </div>
      )}

      <div className="table-container glass-panel">
        <table className="student-table">
          <thead>
            <tr>
              <th>Sl No</th>
              <th onClick={() => handleSort('name')} style={{cursor: 'pointer'}}>Name {sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th>
              <th onClick={() => handleSort('regNo')} style={{cursor: 'pointer'}}>Reg No {sortConfig.key === 'regNo' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th>
              <th onClick={() => handleSort('department')} style={{cursor: 'pointer'}}>Department {sortConfig.key === 'department' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th>
              <th onClick={() => handleSort('atsScore')} style={{cursor: 'pointer'}}>ATS Score {sortConfig.key === 'atsScore' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th>
              <th>Status</th>
              <th onClick={() => handleSort('ctcInLpa')} style={{cursor: 'pointer'}}>CTC (LPA) {sortConfig.key === 'ctcInLpa' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th>
              <th onClick={() => handleSort('createdAt')} style={{cursor: 'pointer'}}>Date Added {sortConfig.key === 'createdAt' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th>
              {(role === 'MANAGER' || role === 'ADMIN' || role === 'LEAD' || role === 'STUDENT') && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student, index) => (
              <tr key={student.id}>
                <td>{index + 1}</td>
                {editingId === student.id ? (
                  <>
                    <td><input name="name" value={editFormData.name || ''} onChange={handleEditChange} style={{width:'80px'}}/></td>
                    <td><input name="regNo" value={editFormData.regNo || ''} onChange={handleEditChange} style={{width:'80px'}}/></td>
                    <td><input name="department" value={editFormData.department || ''} onChange={handleEditChange} style={{width:'80px'}}/></td>
                    <td>{student.atsScore || 0}</td>
                    <td>{student.placedCompany != null ? 'Placed' : 'YTBS'}</td>
                    <td>
                      <input type="number" step="0.1" name="ctcInLpa" value={editFormData.ctcInLpa || ''} onChange={handleEditChange} style={{width:'60px'}}/>
                    </td>
                    <td>{student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => handleResumeUpload(e, student.id)} style={{width: '120px', fontSize: '0.8rem'}}/>
                    </td>
                    <td>
                      <button className="btn-primary" style={{background: '#28a745', marginRight: '0.5rem', padding: '0.25rem 0.5rem'}} onClick={() => handleEditSave(student.id)}>Save</button>
                      <button className="btn-primary" style={{background: '#6c757d', padding: '0.25rem 0.5rem'}} onClick={() => setEditingId(null)}>Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{student.name}</td>
                    <td>{student.regNo}</td>
                    <td>{student.department}</td>
                    <td>
                      <span className={`ats-badge ats-${
                        (student.atsScore || 0) >= 90 ? 'high' : (student.atsScore || 0) >= 70 ? 'med' : 'low'
                      }`}>
                        {student.atsScore || 0}
                      </span>
                    </td>
                    <td>{student.placedCompany != null ? 'Placed' : 'YTBS'}</td>
                    <td>{student.ctcInLpa || '-'}</td>
                    <td>{student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A'}</td>
                    {(role === 'MANAGER' || role === 'ADMIN' || role === 'LEAD' || role === 'STUDENT') && (
                      <td>
                        {role === 'STUDENT' && (
                          <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem'}}>
                            <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => handleResumeUpload(e, student.id)} style={{fontSize: '0.8rem', width: '150px'}}/>
                            <button 
                              className="btn-primary" 
                              style={{background: '#17a2b8', padding: '0.25rem 0.5rem', whiteSpace: 'nowrap'}} 
                              onClick={() => handleComputeSingleAts(student.id)}
                              disabled={computingAtsId === student.id}
                            >
                              {computingAtsId === student.id ? 'Computing...' : 'Compute ATS Score'}
                            </button>
                          </div>
                        )}
                        <button className="btn-primary" style={{marginRight: '0.5rem', padding: '0.25rem 0.5rem'}} onClick={() => setViewStudent(student)}>View More</button>
                        {(role === 'MANAGER' || role === 'ADMIN') && (
                          <>
                            {student.placedCompany == null && (
                              <button className="btn-primary" style={{marginRight: '0.5rem', background: '#28a745', padding: '0.25rem 0.5rem'}} onClick={() => setPlaceStudentData(student)}>Mark Placed</button>
                            )}
                            <button className="btn-primary" style={{marginRight: '0.5rem', background: '#ffc107', color: 'black', padding: '0.25rem 0.5rem'}} onClick={() => handleEditClick(student)}>Edit</button>
                            <button className="btn-primary" style={{background: '#dc3545', padding: '0.25rem 0.5rem'}} onClick={() => handleDelete(student.id)}>Delete</button>
                          </>
                        )}
                      </td>
                    )}
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {viewStudent && (
        <div className="modal-overlay" onClick={() => setViewStudent(null)}>
          <div className="modal-content a4-resume-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setViewStudent(null)}>&times;</button>
            <div className="a4-container">
              {/* Left sidebar */}
              <div className="a4-sidebar">
                 {viewStudent.photoDriveLink && (
                   <img 
                     src={viewStudent.photoDriveLink.includes('drive.google.com') ? `https://drive.google.com/uc?export=view&id=${viewStudent.photoDriveLink.match(/\\/d\\/([a-zA-Z0-9_-]+)/)?.[1]}` : viewStudent.photoDriveLink} 
                     alt="Profile" 
                     className="a4-profile-pic" 
                   />
                 )}
                 <h2 className="a4-name">{viewStudent.name}</h2>
                 <p className="a4-department">{viewStudent.department}</p>
                 <div className="a4-details">
                    <p><strong>Reg No:</strong> {viewStudent.regNo}</p>
                    <p><strong>Email:</strong> {viewStudent.email}</p>
                    <p><strong>Mobile:</strong> {viewStudent.mobileNumber}</p>
                    <p><strong>Gender:</strong> {viewStudent.gender}</p>
                    <p><strong>Resident Type:</strong> {viewStudent.residentType}</p>
                 </div>
                 <div className="a4-education">
                    <h3>Education</h3>
                    <p><strong>SSLC:</strong> {viewStudent.sslcPercentage}% ({viewStudent.sslcYear})</p>
                    <p><strong>HSC:</strong> {viewStudent.hscPercentage}% ({viewStudent.hscYear})</p>
                    <p><strong>UG:</strong> {viewStudent.ugPercentage}% ({viewStudent.ugYear})</p>
                    {viewStudent.pgPercentage != null && <p><strong>PG:</strong> {viewStudent.pgPercentage}% ({viewStudent.pgYear})</p>}
                    <p><strong>Graduation:</strong> {viewStudent.graduationYear}</p>
                 </div>
                 <div className="a4-links">
                    <h3>Links</h3>
                    {viewStudent.githubId && <a href={viewStudent.githubId} target="_blank" rel="noreferrer">GitHub</a>}
                    {viewStudent.linkedinUrl && <a href={viewStudent.linkedinUrl} target="_blank" rel="noreferrer">LinkedIn</a>}
                    {viewStudent.portfolio && <a href={viewStudent.portfolio} target="_blank" rel="noreferrer">Portfolio</a>}
                 </div>
              </div>
              
              {/* Main content - Resume Preview */}
              <div className="a4-main-content">
                <h3>Resume</h3>
                {viewStudent.resumeDriveLink ? (
                  <iframe 
                    src={viewStudent.resumeDriveLink.includes('drive.google.com') ? viewStudent.resumeDriveLink.replace('/view', '/preview') : viewStudent.resumeDriveLink} 
                    title="Resume Viewer" 
                    className="doc-viewer a4-iframe"
                  ></iframe>
                ) : (
                  <div className="no-resume">
                    <p>No Resume Link Provided.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {placeStudentData && (
        <div className="modal-overlay" onClick={() => setPlaceStudentData(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '500px'}}>
            <span className="close-btn" onClick={() => setPlaceStudentData(null)}>&times;</span>
            <h2>Select Company for {placeStudentData.name}</h2>
            <form onSubmit={handlePlaceStudent} style={{display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem'}}>
              
              <div>
                <label>Search Company</label>
                <input 
                  type="text" 
                  placeholder="Search..." 
                  value={companySearch} 
                  onChange={e => setCompanySearch(e.target.value)} 
                  style={{width: '100%', padding: '0.5rem', marginBottom: '0.5rem'}} 
                />
                <select 
                  value={selectedCompanyId} 
                  onChange={e => setSelectedCompanyId(e.target.value)} 
                  required 
                  style={{width: '100%', padding: '0.5rem'}}
                >
                  <option value="">-- Select Company --</option>
                  {filteredCompaniesForSearch.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label>CTC Offered (LPA)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  required
                  value={ctcInput} 
                  onChange={e => setCtcInput(e.target.value)} 
                  style={{width: '100%', padding: '0.5rem'}} 
                />
              </div>

              <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '1rem'}}>
                <button type="submit" className="btn-primary" style={{background: '#28a745'}}>Confirm Placement</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
