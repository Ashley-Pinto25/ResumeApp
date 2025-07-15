import React, { createContext, useEffect, useState } from 'react';
import { type User as FirebaseUser, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  logout: async () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      console.log('Initializing Firebase Auth listener...'); // Debug log
      
      // Check if Firebase is properly configured
      if (!auth) {
        throw new Error('Firebase Auth not initialized');
      }
      
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
        console.log('Auth state changed:', firebaseUser); // Debug log
        
        if (firebaseUser) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || undefined,
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      }, (authError) => {
        console.error('Firebase Auth error:', authError);
        setError(authError.message);
        setLoading(false);
      });

      return unsubscribe;
    } catch (err) {
      console.error('Error setting up Firebase Auth:', err);
      setError(err instanceof Error ? err.message : 'Unknown Firebase error');
      // Set loading to false so the app can still render
      setLoading(false);
      setUser(null);
    }
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    loading,
    error,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
