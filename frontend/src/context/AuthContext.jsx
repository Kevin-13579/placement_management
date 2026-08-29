import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Roles: ADMIN, MANAGER, LEAD, STUDENT
  const [role, setRole] = useState(null); // No default role
  const [user, setUser] = useState(null);

  const login = (newRole, userData = null) => {
    setRole(newRole);
    if (userData) {
      setUser(userData);
    }
  };

  const logout = () => {
    setRole(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ role, user, login, logout, setRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
