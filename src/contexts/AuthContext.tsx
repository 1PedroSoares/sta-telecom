import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  role: 'client' | 'employee';
  fullName: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string, role: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    // Mock authentication
    setTimeout(() => {
      setUser({
        id: '1',
        email,
        role: email.includes('admin') ? 'employee' : 'client',
        fullName: 'João Silva'
      });
      setLoading(false);
    }, 1000);
    return { error: null };
  };

  const signUp = async (email: string, password: string, fullName: string, role: string) => {
    setLoading(true);
    // Mock signup
    setTimeout(() => {
      setUser({
        id: '1',
        email,
        role: role as 'client' | 'employee',
        fullName
      });
      setLoading(false);
    }, 1000);
    return { error: null };
  };

  const signOut = async () => {
    setUser(null);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};