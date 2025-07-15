import { createContext } from 'react';
import type { User } from '../types';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

// Create context with a non-undefined default value for better error handling
export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {}
});
