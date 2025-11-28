// lib/auth.ts
import { User } from '@prisma/client'; 
import * as bcrypt from 'bcryptjs'; 

// Tipe data user untuk client (tanpa password)
export type ClientUser = Omit<User, 'password' | 'securityAnswer' | 'createdAt' | 'updatedAt' | 'transactions' | 'budgetLimit' | 'savingsGoals'>;

const saltRounds = 10;

export const hashPassword = async (password: string) => {
    return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hash: string) => {
    return bcrypt.compare(password, hash); 
};

// Helper untuk otentikasi API (Membaca Header yang diset oleh Middleware)
export function getUserIdFromRequest(request: Request): string | null {
    // Middleware sudah memvalidasi cookie dan menaruh ID-nya di header 'x-user-id'
    return request.headers.get('x-user-id');
}

// --- Frontend Session Management ---

// Fungsi Helper untuk Cookie (Browser Only)
function setCookie(name: string, value: string, days: number) {
    if (typeof document === 'undefined') return;
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    // Secure cookies, SameSite=Lax
    document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax;Secure`; 
}

function deleteCookie(name: string) {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/;SameSite=Lax`;
}

// 1. Simpan Sesi (Login/Register)
export const persistUserSession = (userData: ClientUser) => {
    if (typeof window !== 'undefined') {
        // Simpan data user di Storage (untuk akses cepat UI)
        sessionStorage.setItem('currentUser', JSON.stringify(userData));
        
        // [BEST PRACTICE] Simpan Token ID di Cookie untuk Middleware
        setCookie('session_token_mock', userData.id, 7); // Expire 7 hari
    }
}

// 2. Hapus Sesi (Logout)
export const clearUserSession = () => {
    if (typeof window !== 'undefined') {
        sessionStorage.removeItem('currentUser');
        
        // [BEST PRACTICE] Hapus Cookie agar Middleware memblokir akses
        deleteCookie('session_token_mock');
    }
}

// 3. Ambil Data Sesi (Untuk Context/UI)
export const getClientUserSession = (): ClientUser | null => {
    if (typeof window !== 'undefined') {
        const stored = sessionStorage.getItem('currentUser');
        return stored ? JSON.parse(stored) : null;
    }
    return null;
}