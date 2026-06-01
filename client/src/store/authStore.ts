import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Grab initial state from localStorage if available
  const storedToken = localStorage.getItem('flowmeet_token');
  const storedUser = localStorage.getItem('flowmeet_user');

  let user: User | null = null;
  if (storedUser) {
    try {
      user = JSON.parse(storedUser);
    } catch (e) {
      console.error('Failed to parse user from localStorage');
    }
  }

  return {
    token: storedToken,
    user,
    isAuthenticated: !!storedToken && !!user,
    login: (token, user) => {
      localStorage.setItem('flowmeet_token', token);
      localStorage.setItem('flowmeet_user', JSON.stringify(user));
      set({ token, user, isAuthenticated: true });
    },
    logout: () => {
      localStorage.removeItem('flowmeet_token');
      localStorage.removeItem('flowmeet_user');
      set({ token: null, user: null, isAuthenticated: false });
    },
  };
});
