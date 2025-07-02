
import React, { createContext, useEffect, useState } from 'react';
import { User, AuthContextType } from '@/types/auth';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('forum_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    // Mock sign in - replace with Supabase auth
    const mockUser: User = {
      id: '1',
      email,
      username: email.split('@')[0],
      role: email === 'admin@test.com' ? 'admin' : 'user',
      joinDate: '2024-01-15',
      reputation: 127,
      isActive: true,
      bio: 'Hockey enthusiast and forum member'
    };
    setUser(mockUser);
    localStorage.setItem('forum_user', JSON.stringify(mockUser));
    setLoading(false);
  };

  const signUp = async (email: string, password: string, username: string) => {
    setLoading(true);
    // Mock sign up - replace with Supabase auth
    const mockUser: User = {
      id: Date.now().toString(),
      email,
      username,
      role: 'user',
      joinDate: new Date().toISOString().split('T')[0],
      reputation: 0,
      isActive: true
    };
    setUser(mockUser);
    localStorage.setItem('forum_user', JSON.stringify(mockUser));
    setLoading(false);
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('forum_user');
  };

  const isAdmin = user?.role === 'admin';
  const isModerator = user?.role === 'moderator' || isAdmin;

  return (
    <AuthContext.Provider value={{ 
      user, 
      signIn, 
      signUp, 
      signOut, 
      loading, 
      isAdmin, 
      isModerator 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
