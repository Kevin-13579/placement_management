import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';
import './LoginPage.css';

const LoginPage = () => {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username) {
        setError('Please select a role first.');
        return;
    }
    try {
      // Mock fast login by username if it's admin/manager/lead
      const roleStr = username.toUpperCase();
      if (['ADMIN', 'MANAGER', 'LEAD'].includes(roleStr)) {
        if (password === '123') {
          login(roleStr);
        } else {
          setError('Invalid password. Default is 123');
        }
      } else if (roleStr === 'STUDENT') {
        // Attempt Student Login
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'https://YOUR_RENDER_APP_NAME.onrender.com'}/api/students`);
        const students = res.data;
        // Find student by register number (password)
        const student = students.find(s => s.regNo === password);
        
        if (student) {
          login('STUDENT', student);
        } else {
          setError('Invalid register number. Could not find student profile.');
        }
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <div className="theme-toggle-wrapper">
        <button onClick={toggleTheme} className="btn-toggle-theme login-toggle">
          {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
        </button>
      </div>
      <div className="login-box glass-panel">
        <h2>Placement Portal</h2>
        <p className="login-subtitle">Select your role to sign in</p>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleLogin}>
          
          <div className="role-buttons" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {['ADMIN', 'MANAGER', 'LEAD', 'STUDENT'].map(roleOption => (
              <button 
                type="button" 
                key={roleOption}
                onClick={() => setUsername(roleOption)}
                className={username === roleOption ? 'btn-primary' : ''}
                style={{
                  padding: '0.5rem 1rem', 
                  borderRadius: '20px', 
                  border: username === roleOption ? 'none' : '1px solid var(--border-color)',
                  background: username === roleOption ? 'var(--primary-color)' : 'transparent',
                  color: username === roleOption ? 'white' : 'var(--text-color)',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease'
                }}
              >
                {roleOption.charAt(0) + roleOption.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <div className="input-group">
            <label>{username === 'STUDENT' ? 'Registration Number' : 'Password'}</label>
            <input 
              type={username === 'STUDENT' ? 'text' : 'password'} 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder={username === 'STUDENT' ? 'Enter Reg No' : 'Enter password'}
              required
            />
          </div>
          <button type="submit" className="btn-primary login-btn">Login</button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
