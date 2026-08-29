import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import './LoginPage.css';

const LoginPage = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
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
        const res = await axios.get('http://localhost:8080/api/students');
        const students = res.data;
        // Find student by register number (password)
        const student = students.find(s => s.regNo === password);
        
        if (student) {
          login('STUDENT', student);
        } else {
          setError('Invalid register number. Could not find student profile.');
        }
      } else {
        setError('Invalid username. Please use admin, manager, lead, or student.');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Placement Portal Login</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              placeholder="e.g., admin"
              required 
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Enter password"
            />
          </div>
          <button type="submit" className="btn-primary login-btn">Login</button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
