import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

// Pages
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard/StudentDashboard';
import PlacementTeamDashboard from './pages/PlacementTeamDashboard/PlacementTeamDashboard';
import CompanyDashboard from './pages/CompanyDashboard/CompanyDashboard';
import ReportsDashboard from './pages/ReportsDashboard/ReportsDashboard';
import LoginPage from './pages/LoginPage/LoginPage';

import { ThemeProvider, useTheme } from './context/ThemeContext';

const Navbar = () => {
  const { role, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  return (
    <nav className="navbar glass-panel">
      <div className="logo">Placement Portal</div>
      <div className="role-switcher">
        <button onClick={toggleTheme} className="btn-toggle-theme">
          {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
        </button>
        <label>Active Role: <strong>{role}</strong></label>
        <button onClick={logout} className="btn-logout" style={{marginLeft: '1rem', padding: '0.5rem', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>Logout</button>
      </div>
    </nav>
  );
};

const Sidebar = () => {
  const { role } = useAuth();
  
  return (
    <aside className="sidebar glass-panel">
      <h3>Dashboards</h3>
      <ul>
        {role === 'ADMIN' && <li><Link to="/admin">Admin Panel</Link></li>}
        
        {(role === 'MANAGER' || role === 'LEAD' || role === 'STUDENT' || role === 'ADMIN') && (
          <li><Link to="/student">Student Data</Link></li>
        )}
        
        {(role === 'MANAGER' || role === 'LEAD' || role === 'ADMIN') && (
          <>
            <li><Link to="/placement">Placement Pipeline</Link></li>
            <li><Link to="/company">Company Directory</Link></li>
            <li><Link to="/reports">Reports & Analytics</Link></li>
          </>
        )}
      </ul>
    </aside>
  );
};

const DashboardRouter = () => {
  const { role } = useAuth();
  
  if (!role) {
    return <LoginPage />;
  }

  // Determine default route
  let defaultRoute = '/student';
  if (role === 'ADMIN') defaultRoute = '/admin';
  else if (role === 'LEAD' || role === 'MANAGER') defaultRoute = '/placement';

  return (
    <div className="app-container">
      <Navbar />
      <div className="layout-container">
        <Sidebar />
        <div className="content">
          <Routes>
            <Route path="/" element={<Navigate to={defaultRoute} />} />
            
            {role === 'ADMIN' && <Route path="/admin" element={<AdminDashboard />} />}
            {(role === 'MANAGER' || role === 'LEAD' || role === 'STUDENT' || role === 'ADMIN') && 
              <Route path="/student" element={<StudentDashboard />} />
            }
            {(role === 'MANAGER' || role === 'LEAD' || role === 'ADMIN') && (
              <>
                <Route path="/placement" element={<PlacementTeamDashboard />} />
                <Route path="/company" element={<CompanyDashboard />} />
                <Route path="/reports" element={<ReportsDashboard />} />
              </>
            )}
            
            <Route path="*" element={<div style={{padding: '2rem'}}>Select a valid dashboard or you do not have permission.</div>} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <DashboardRouter />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
