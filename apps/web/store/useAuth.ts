import { create } from 'zustand';
import axios from 'axios';

interface User {
    id: string;
    walletAddress: string;
    role: "LANDLORD" | "TENANT";
    name: string;
    email: string;
    phone?: string;
    landlordBuildingId?: string;
}

interface AuthState {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    checkSession: () => Promise<void>;
    logout: () => Promise<void>;
    setUser: (user: User | null) => void;
}

export const useAuth = create<AuthState>((set) => ({
    user: null,
    isLoading: true,
    isAuthenticated: false,

    setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user, 
        isLoading: false 
    }),

    checkSession: async () => {
        try {
            set({ isLoading: true });
            const res = await axios.get('/api/auth/me');
            if (res.data.success && res.data.user) {
                set({ user: res.data.user, isAuthenticated: true });
            } else {
                set({ user: null, isAuthenticated: false });
            }
        } catch (error) {
            set({ user: null, isAuthenticated: false });
        } finally {
            set({ isLoading: false });
        }
    },

    logout: async () => {
        try {
            await axios.post('/api/auth/logout');
            set({ user: null, isAuthenticated: false });
            window.location.href = '/login';
        } catch (error) {
            
            
            set({ user: null, isAuthenticated: false });
            window.location.href = '/login';
        }
    }
}));
