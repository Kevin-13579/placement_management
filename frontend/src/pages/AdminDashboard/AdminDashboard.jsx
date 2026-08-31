import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('manage-users');
  
  // Data States
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [students, setStudents] = useState([]);
  
  // Form States for New User
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('LEAD');

  // Form States for New Company
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyLocation, setNewCompanyLocation] = useState('');
  const [newCompanySize, setNewCompanySize] = useState('');
  const [newCompanyCtc, setNewCompanyCtc] = useState('');
  const [newContactPerson, setNewContactPerson] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactMobile, setNewContactMobile] = useState('');
  const [jdFile, setJdFile] = useState(null);
  
  // File State
  const [file, setFile] = useState(null);
  const [companyFile, setCompanyFile] = useState(null);

  // View JD Modal State
  const [viewJdLink, setViewJdLink] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchCompanies();
    fetchStudents();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://YOUR_RENDER_APP_NAME.onrender.com'}/api/users`);
      const data = await res.json();
      setUsers(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://YOUR_RENDER_APP_NAME.onrender.com'}/api/companies`);
      const data = await res.json();
      setCompanies(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://YOUR_RENDER_APP_NAME.onrender.com'}/api/students`);
      const data = await res.json();
      setStudents(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'https://YOUR_RENDER_APP_NAME.onrender.com'}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername, password: newPassword, role: newRole })
      });
      setNewUsername('');
      setNewPassword('');
      fetchUsers();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'https://YOUR_RENDER_APP_NAME.onrender.com'}/api/users/${id}`, { method: 'DELETE' });
      fetchUsers();
    } catch (e) {
      console.error(e);
    }
  };

  const handleApproveCompany = async (id) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'https://YOUR_RENDER_APP_NAME.onrender.com'}/api/companies/${id}/approve`, { method: 'PUT' });
      fetchCompanies();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRejectCompany = async (id) => {
    if (!window.confirm("Are you sure you want to reject and remove this company?")) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'https://YOUR_RENDER_APP_NAME.onrender.com'}/api/companies/${id}`, { method: 'DELETE' });
      fetchCompanies();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddCompany = async (e) => {
    e.preventDefault();
    try {
      let uploadedJdLink = null;
      if (jdFile) {
        const formData = new FormData();
        formData.append("file", jdFile);
        const uploadRes = await fetch(`${import.meta.env.VITE_API_URL || 'https://YOUR_RENDER_APP_NAME.onrender.com'}/api/companies/upload-jd`, {
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

      await fetch(`${import.meta.env.VITE_API_URL || 'https://YOUR_RENDER_APP_NAME.onrender.com'}/api/companies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newCompanyName,
          location: newCompanyLocation,
          companySize: newCompanySize,
          ctcInLpa: parseFloat(newCompanyCtc) || null,
          contactPerson: newContactPerson,
          contactPersonEmail: newContactEmail,
          contactPersonMobile: newContactMobile,
          jdLink: uploadedJdLink,
          approved: true // Admins bypass approval
        })
      });
      setNewCompanyName('');
      setNewCompanyLocation('');
      setNewCompanySize('');
      setNewCompanyCtc('');
      setNewContactPerson('');
      setNewContactEmail('');
      setNewContactMobile('');
      setJdFile(null);
      fetchCompanies();
    } catch (e) {
      console.error(e);
    }
  };

  const handleFileUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'https://YOUR_RENDER_APP_NAME.onrender.com'}/api/students/upload`, {
        method: 'POST',
        body: formData
      });
      alert('Upload successful!');
      fetchStudents();
    } catch (e) {
      console.error(e);
      alert('Upload failed!');
    }
  };

  const handleCompanyFileUpload = async () => {
    if (!companyFile) return;
    const formData = new FormData();
    formData.append("file", companyFile);
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'https://YOUR_RENDER_APP_NAME.onrender.com'}/api/companies/upload-bulk`, {
        method: 'POST',
        body: formData
      });
      alert('Company bulk upload successful!');
      fetchCompanies();
    } catch (e) {
      console.error(e);
      alert('Company bulk upload failed!');
    }
  };

  const [computingAts, setComputingAts] = useState(false);

  const handleComputeAts = async () => {
    setComputingAts(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://YOUR_RENDER_APP_NAME.onrender.com'}/api/students/compute-ats-bulk`, { method: 'POST' });
      const data = await res.json();
      alert(data.message || "Computation complete!");
    } catch (e) {
      console.error(e);
      alert('Failed to compute ATS scores.');
    } finally {
      setComputingAts(false);
    }
  };

  const pendingCompanies = companies.filter(c => !c.approved);

  const totalStudents = students.length;
  const placedStudents = students.filter(s => s.placedCompany != null).length;
  const unplacedStudents = totalStudents - placedStudents;
  const placedStudentsWithCtc = students.filter(s => s.placedCompany != null && s.ctcInLpa != null);
  const avgCtc = placedStudentsWithCtc.length > 0 
    ? (placedStudentsWithCtc.reduce((sum, s) => sum + parseFloat(s.ctcInLpa), 0) / placedStudentsWithCtc.length).toFixed(2) 
    : 0;

  return (
    <div className="dashboard-container">
      <h1>Admin Control Panel</h1>
      
      <div className="admin-stats-row" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="admin-tab-card" style={{ flex: 1, cursor: 'default' }}>
          <h3>Total Students</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{totalStudents}</p>
        </div>
        <div className="admin-tab-card" style={{ flex: 1, cursor: 'default', borderLeft: '4px solid #28a745' }}>
          <h3>Placed Students</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{placedStudents}</p>
        </div>
        <div className="admin-tab-card" style={{ flex: 1, cursor: 'default', borderLeft: '4px solid #dc3545' }}>
          <h3>Unplaced Students</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{unplacedStudents}</p>
        </div>
        <div className="admin-tab-card" style={{ flex: 1, cursor: 'default', borderLeft: '4px solid #17a2b8' }}>
          <h3>Average CTC</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{avgCtc} LPA</p>
        </div>
      </div>

      <div className="admin-grid">
        <div className={`admin-tab-card ${activeTab === 'manage-users' ? 'active-card' : ''}`} onClick={() => setActiveTab('manage-users')}>
          <h2>Team Management</h2>
          <p>{users.length} Active Members</p>
        </div>
        
        <div className={`admin-tab-card ${activeTab === 'approvals' ? 'active-card' : ''}`} onClick={() => setActiveTab('approvals')}>
          <h2>Approvals</h2>
          <p>{pendingCompanies.length} Pending Companies</p>
        </div>

        <div className={`admin-tab-card ${activeTab === 'add-companies' ? 'active-card' : ''}`} onClick={() => setActiveTab('add-companies')}>
          <h2>Add Companies</h2>
          <p>Directly add approved companies</p>
        </div>
        
        <div className={`admin-tab-card ${activeTab === 'data-import' ? 'active-card' : ''}`} onClick={() => setActiveTab('data-import')}>
          <h2>Data Import</h2>
          <p>Bulk upload student data</p>
        </div>
      </div>

      <div className="admin-content-area">
        {activeTab === 'manage-users' && (
          <div className="admin-content-panel">
            <h2>Team Management</h2>
            <form onSubmit={handleAddUser} className="form-group-flex">
              <div className="floating-label-group">
                <input type="text" placeholder=" " value={newUsername} onChange={e => setNewUsername(e.target.value)} required />
                <label>Username</label>
              </div>
              <div className="floating-label-group">
                <input type="password" placeholder=" " value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                <label>Password</label>
              </div>
              <div className="floating-label-group">
                <select value={newRole} onChange={e => setNewRole(e.target.value)}>
                  <option value="LEAD">Lead</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <label style={{top: '0.25rem', fontSize: '0.75rem', color: 'var(--accent)', transform: 'translateY(0)'}}>Role</label>
              </div>
              <button type="submit" className="btn-primary" style={{alignSelf: 'stretch', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Add Member</button>
            </form>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.username}</td>
                    <td><span className={`status-badge ${u.role === 'ADMIN' ? 'status-hot' : 'status-warm'}`}>{u.role}</span></td>
                    <td>
                      {u.role !== 'ADMIN' && <button className="btn-primary" style={{backgroundColor: '#dc3545', padding: '0.25rem 0.5rem'}} onClick={() => handleDeleteUser(u.id)}>Fire</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'approvals' && (
          <div className="admin-content-panel">
            <h2>Pending Company Approvals</h2>
            {pendingCompanies.length === 0 ? <p>No pending approvals.</p> : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Company Name</th>
                    <th>Location</th>
                    <th>Size</th>
                    <th>CTC (LPA)</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingCompanies.map(c => (
                    <tr key={c.id}>
                      <td>{c.name}</td>
                      <td>{c.location || 'N/A'}</td>
                      <td>{c.companySize || 'N/A'}</td>
                      <td>{c.ctcInLpa || 'N/A'}</td>
                      <td>
                        <button className="btn-primary" onClick={() => setViewJdLink(c.jdLink)} style={{padding: '0.25rem 0.5rem', marginRight: '0.5rem', background: '#17a2b8'}}>View JD</button>
                        <button className="btn-primary" onClick={() => handleApproveCompany(c.id)} style={{padding: '0.25rem 0.5rem', marginRight: '0.5rem'}}>Approve</button>
                        <button className="btn-primary" onClick={() => handleRejectCompany(c.id)} style={{padding: '0.25rem 0.5rem', background: '#dc3545', border: 'none'}}>Reject</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'add-companies' && (
          <div className="admin-content-panel">
            <h2>Add Company</h2>
            <form onSubmit={handleAddCompany} className="form-group-col">
              <div className="floating-label-group">
                <input type="text" placeholder=" " value={newCompanyName} onChange={e => setNewCompanyName(e.target.value)} required />
                <label>Company Name</label>
              </div>
              <div className="floating-label-group">
                <input type="text" placeholder=" " value={newCompanyLocation} onChange={e => setNewCompanyLocation(e.target.value)} required />
                <label>Location</label>
              </div>
              <div className="floating-label-group">
                <input type="text" placeholder=" " value={newCompanySize} onChange={e => setNewCompanySize(e.target.value)} />
                <label>Company Size</label>
              </div>
              <div className="floating-label-group">
                <input type="number" step="0.1" placeholder=" " value={newCompanyCtc} onChange={e => setNewCompanyCtc(e.target.value)} />
                <label>CTC (LPA)</label>
              </div>
              <div className="floating-label-group">
                <input type="text" placeholder=" " value={newContactPerson} onChange={e => setNewContactPerson(e.target.value)} />
                <label>Contact Person</label>
              </div>
              <div className="floating-label-group">
                <input type="email" placeholder=" " value={newContactEmail} onChange={e => setNewContactEmail(e.target.value)} />
                <label>Contact Email</label>
              </div>
              <div className="floating-label-group">
                <input type="text" placeholder=" " value={newContactMobile} onChange={e => setNewContactMobile(e.target.value)} />
                <label>Contact Mobile</label>
              </div>
              <div>
                <label style={{fontSize: '0.9rem', marginBottom: '0.25rem', display: 'block'}}>JD File (PDF/DOC)</label>
                <input type="file" accept=".pdf,.doc,.docx" onChange={e => setJdFile(e.target.files[0])} className="form-input" style={{padding: '0.25rem'}} />
              </div>
              <button type="submit" className="btn-primary">Add Approved Company</button>
            </form>
          </div>
        )}

        {activeTab === 'data-import' && (
          <div className="admin-content-panel">
            <h2>Data Import & Tools</h2>
            <div className="admin-action-bar">
              <input type="file" onChange={e => setFile(e.target.files[0])} className="form-input" />
              <button onClick={handleFileUpload} className="btn-primary">Upload Excel</button>
            </div>
            
            <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>Bulk Import Companies</h3>
            <div className="admin-action-bar" style={{ marginBottom: '1.5rem' }}>
              <input type="file" onChange={e => setCompanyFile(e.target.files[0])} className="form-input" />
              <button onClick={handleCompanyFileUpload} className="btn-primary">Upload Companies Excel</button>
            </div>

            <div style={{borderTop: '1px solid #ddd', paddingTop: '1.5rem'}}>
              <h3>Compute ATS Scores (Gemini AI)</h3>
              <p style={{color: 'var(--text-light)', marginBottom: '1rem', fontSize: '0.9rem'}}>Automatically analyze un-scored resumes via Gemini and assign an ATS matching score.</p>
              <button onClick={handleComputeAts} disabled={computingAts} className="btn-primary" style={{background: computingAts ? '#ccc' : '#17a2b8', border: 'none'}}>
                {computingAts ? 'Computing...' : 'Compute Pending ATS Scores'}
              </button>
            </div>

            <div style={{borderTop: '1px solid #ddd', paddingTop: '1.5rem', marginTop: '1.5rem'}}>
              <h3 style={{ color: '#dc3545' }}>Danger Zone</h3>
              <p style={{color: 'var(--text-light)', marginBottom: '1rem', fontSize: '0.9rem'}}>Delete all students and companies data from the database. This action is irreversible.</p>
              <button onClick={async () => {
                if (!window.confirm("CRITICAL WARNING: Are you sure you want to delete ALL students and companies data? This action is irreversible!")) return;
                try {
                  await fetch(`${import.meta.env.VITE_API_URL || 'https://YOUR_RENDER_APP_NAME.onrender.com'}/api/students/bulk-delete`, { method: 'DELETE' });
                  await fetch(`${import.meta.env.VITE_API_URL || 'https://YOUR_RENDER_APP_NAME.onrender.com'}/api/companies/bulk-delete`, { method: 'DELETE' });
                  alert('All students and companies data have been successfully deleted.');
                  fetchStudents();
                  fetchCompanies();
                } catch (e) {
                  console.error(e);
                  alert('Failed to delete all data!');
                }
              }} className="btn-primary" style={{background: '#dc3545', border: 'none'}}>
                Delete All Data
              </button>
            </div>
          </div>
        )}
      </div>

      {viewJdLink !== null && (
        <div className="modal-overlay" onClick={() => setViewJdLink(null)}>
          <div className="modal-content" style={{maxWidth: '800px', height: '80vh', display: 'flex', flexDirection: 'column', zIndex: 1000}} onClick={e => e.stopPropagation()}>
            <span className="close-btn" onClick={() => setViewJdLink(null)}>&times;</span>
            <h2 style={{marginBottom: '1rem'}}>Job Description</h2>
            {viewJdLink ? (
              <iframe 
                src={viewJdLink.includes('drive.google.com') ? viewJdLink.replace('/view', '/preview') : (viewJdLink.endsWith('.pdf') ? `https://docs.google.com/viewer?url=${encodeURIComponent(viewJdLink)}&embedded=true` : viewJdLink)} 
                title="JD Viewer" 
                style={{flex: 1, width: '100%', border: 'none'}}
              ></iframe>
            ) : (
              <p>No JD Link Provided for this company.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
