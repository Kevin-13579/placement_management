import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './PlacementTeamDashboard.css';

const PlacementTeamDashboard = () => {
  const { role } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);
  
  // Filters for table
  const [ctcFilter, setCtcFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);

  // View JD Modal State
  const [viewJdLink, setViewJdLink] = useState(null);

  useEffect(() => {
    fetchCompanies();
    fetchUsers();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://YOUR_RENDER_APP_NAME.onrender.com'}/api/companies`);
      const data = await res.json();
      setCompanies(data.filter(c => c.approved));
    } catch (e) {
      console.error(e);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://YOUR_RENDER_APP_NAME.onrender.com'}/api/users`);
      const data = await res.json();
      setUsers(data.filter(u => u.role === 'LEAD' || u.role === 'MANAGER'));
    } catch (e) {
      console.error(e);
    }
  };

  const openEditModal = (company) => {
    setEditingCompany({ ...company });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingCompany(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveCompany = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://YOUR_RENDER_APP_NAME.onrender.com'}/api/companies/${editingCompany.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingCompany.name,
          location: editingCompany.location,
          companySize: editingCompany.companySize,
          ctcInLpa: parseFloat(editingCompany.ctcInLpa) || null,
          contactPerson: editingCompany.contactPerson,
          contactPersonEmail: editingCompany.contactPersonEmail,
          contactPersonMobile: editingCompany.contactPersonMobile,
          jdLink: editingCompany.jdLink,
          status: editingCompany.status,
          candidatesPlaced: editingCompany.candidatesPlaced ? parseInt(editingCompany.candidatesPlaced) : null
        })
      });
      if (res.ok) {
        setShowEditModal(false);
        fetchCompanies();
      } else {
        alert("Failed to update company");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating company");
    }
  };

  const handleDeleteCompany = async () => {
    if (!window.confirm(`Are you sure you want to remove ${editingCompany.name}?`)) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://YOUR_RENDER_APP_NAME.onrender.com'}/api/companies/${editingCompany.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setShowEditModal(false);
        fetchCompanies();
      } else {
        alert("Failed to delete company");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting company");
    }
  };

  const renderKanbanColumn = (title, status) => {
    const colCompanies = companies.filter(c => c.status === status);
    return (
      <div className="kanban-col">
        <h3>{title} <span style={{fontSize:'0.8rem', color:'gray'}}>({colCompanies.length})</span></h3>
        {colCompanies.map(c => (
          <div key={c.id} className="kanban-card">
            <h4>{c.name}</h4>
            <p style={{fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem'}}>{c.location || 'No Location'}</p>
            <p style={{fontSize: '0.8rem'}}>Added: {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A'}</p>
          </div>
        ))}
      </div>
    );
  };

  const filteredCompanies = companies.filter(c => {
    const matchStatus = statusFilter ? c.status === statusFilter : true;
    const matchCtc = ctcFilter ? (c.ctcInLpa && parseFloat(c.ctcInLpa) <= parseFloat(ctcFilter)) : true;
    return matchStatus && matchCtc;
  }).sort((a, b) => (parseFloat(b.ctcInLpa) || 0) - (parseFloat(a.ctcInLpa) || 0));

  return (
    <div className="dashboard-container split-layout">
      <div className="main-panel">
        <h2>Companies Kanban Board</h2>
        <div className="kanban-board">
          {renderKanbanColumn('Cold', 'COLD')}
          {renderKanbanColumn('Warm', 'WARM')}
          {renderKanbanColumn('Hot', 'HOT')}
          {renderKanbanColumn('Completed', 'DRIVE_COMPLETED')}
        </div>
        
        <h2>All Companies Directory</h2>
        <div className="filters-bar">
          <input 
            type="text" 
            placeholder="Filter by CTC (e.g. 12)" 
            value={ctcFilter} 
            onChange={(e) => setCtcFilter(e.target.value)} 
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="COLD">Cold</option>
            <option value="WARM">Warm</option>
            <option value="HOT">Hot</option>
            <option value="DRIVE_COMPLETED">Drive Completed</option>
          </select>
        </div>

        <div className="card" style={{padding: 0, overflowX: 'auto'}}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Company Name</th>
                <th>Location</th>
                <th>Size</th>
                <th>CTC (LPA)</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.map(c => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.location || 'N/A'}</td>
                  <td>{c.companySize || 'N/A'}</td>
                  <td>{c.ctcInLpa || 'N/A'}</td>
                  <td>
                    <span className={`status-badge status-${c.status ? c.status.toLowerCase() : 'cold'}`}>
                      {c.status || 'COLD'}
                    </span>
                  </td>
                  <td>
                    <button className="btn-primary" onClick={() => setViewJdLink(c.jdLink)} style={{padding: '0.25rem 0.5rem', fontSize: '0.85rem', marginRight: '0.5rem', background: '#17a2b8'}}>
                      View JD
                    </button>
                    <button className="btn-primary" onClick={() => openEditModal(c)} style={{padding: '0.25rem 0.5rem', fontSize: '0.85rem', background: '#ffc107', color: 'black'}}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCompanies.length === 0 && (
                <tr>
                  <td colSpan="6" style={{textAlign:'center'}}>No companies match criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="side-panel">
        <h3>Team Members</h3>
        <p style={{color:'var(--text-light)', fontSize:'0.9rem', marginBottom:'1rem'}}>Active Leads & Managers</p>
        <ul style={{listStyle:'none', padding:0}}>
          {users.map(u => (
            <li key={u.id} style={{padding:'0.75rem', borderBottom:'1px solid var(--border-color)'}}>
              <strong>{u.username}</strong>
              <div style={{fontSize:'0.8rem', color:'var(--primary-color)', marginTop:'0.25rem'}}>{u.role}</div>
            </li>
          ))}
          {users.length === 0 && <p>No team members found.</p>}
        </ul>
      </div>

      {showEditModal && editingCompany && (
        <div className="modal-overlay">
          <div className="modal-content" style={{maxWidth: '500px'}}>
            <span className="close-btn" onClick={() => setShowEditModal(false)}>&times;</span>
            <h2>Edit Company Details</h2>
            <form onSubmit={handleSaveCompany} style={{display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem'}}>
              
              <div>
                <label>Company Name</label>
                <input type="text" name="name" value={editingCompany.name || ''} onChange={handleEditChange} required style={{width: '100%', padding: '0.5rem'}} />
              </div>
              
              <div>
                <label>Location</label>
                <input type="text" name="location" value={editingCompany.location || ''} onChange={handleEditChange} style={{width: '100%', padding: '0.5rem'}} />
              </div>
              
              <div>
                <label>Company Size</label>
                <input type="text" name="companySize" value={editingCompany.companySize || ''} onChange={handleEditChange} style={{width: '100%', padding: '0.5rem'}} />
              </div>
              
              <div>
                <label>CTC Offered (LPA)</label>
                <input type="number" step="0.1" name="ctcInLpa" value={editingCompany.ctcInLpa || ''} onChange={handleEditChange} style={{width: '100%', padding: '0.5rem'}} />
              </div>

              <div>
                <label>Contact Person</label>
                <input type="text" name="contactPerson" value={editingCompany.contactPerson || ''} onChange={handleEditChange} style={{width: '100%', padding: '0.5rem'}} />
              </div>
              
              <div>
                <label>Contact Email</label>
                <input type="email" name="contactPersonEmail" value={editingCompany.contactPersonEmail || ''} onChange={handleEditChange} style={{width: '100%', padding: '0.5rem'}} />
              </div>
              
              <div>
                <label>Contact Mobile</label>
                <input type="text" name="contactPersonMobile" value={editingCompany.contactPersonMobile || ''} onChange={handleEditChange} style={{width: '100%', padding: '0.5rem'}} />
              </div>

              <div>
                <label>JD File Link / Name</label>
                <input type="text" name="jdLink" value={editingCompany.jdLink || ''} onChange={handleEditChange} style={{width: '100%', padding: '0.5rem'}} />
              </div>
              
              <div>
                <label>Status</label>
                <select name="status" value={editingCompany.status || 'COLD'} onChange={handleEditChange} style={{width: '100%', padding: '0.5rem'}}>
                  <option value="COLD">COLD</option>
                  <option value="WARM">WARM</option>
                  <option value="HOT">HOT</option>
                  <option value="DRIVE_COMPLETED">DRIVE_COMPLETED</option>
                </select>
              </div>

              {editingCompany.status === 'DRIVE_COMPLETED' && (
                <div>
                  <label>Candidates Placed</label>
                  <input type="number" name="candidatesPlaced" value={editingCompany.candidatesPlaced || ''} onChange={handleEditChange} required style={{width: '100%', padding: '0.5rem'}} />
                </div>
              )}

              <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '1rem'}}>
                <button type="button" className="btn-primary" onClick={handleDeleteCompany} style={{background: '#dc3545', border: 'none'}}>Remove Company</button>
                <button type="submit" className="btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewJdLink !== null && (
        <div className="modal-overlay" onClick={() => setViewJdLink(null)}>
          <div className="modal-content" style={{maxWidth: '800px', height: '80vh', display: 'flex', flexDirection: 'column'}} onClick={e => e.stopPropagation()}>
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

export default PlacementTeamDashboard;
