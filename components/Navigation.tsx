'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
// NEW: Import BookOpen untuk logo, seperti contoh
import { LayoutDashboard, TrendingUp, Target, LogOut, BookOpen } from 'lucide-react';

// --- Nav Items (Tanpa Profile, karena profile ada di desktop/bottom) ---
const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: TrendingUp },
  { href: '/savings', label: 'Savings', icon: Target },
];

/**
 * =======================
 * Navigasi Atas (Desktop)
 * =======================
 * Ditampilkan HANYA di desktop (hidden lg:flex)
 */
function DesktopNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const userInitials = user?.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'US';

  // Style: 'sticky' akan menempel di atas saat scroll
  // 'hidden lg:flex' - HANYA tampil di desktop
  return (
    <nav className="hidden lg:flex border-b-2 border-black bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between h-16">
          
          {/* Sisi Kiri: Logo & Link Navigasi */}
          <div className="flex items-center space-x-6">
            
            {/* Logo (Mirip contoh) */}
            <Link href="/dashboard" className="flex items-center gap-2 text-black hover:opacity-80 transition-opacity">
              <Image className='rounded-md' src="/apple-touch-icon.png" alt="Wallet Icon" width={32} height={32} />
              <span className="font-bold text-lg">CashMap</span>
            </Link>

            {/* Link Navigasi */}
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-4 text-sm font-semibold transition-colors ${
                    isActive
                      ? 'border-black text-black'
                      : 'border-transparent text-gray-500 hover:text-black hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Sisi Kanan: Profile (Avatar) & Logout */}
          <div className="flex items-center gap-4">
            <Link href="/profile" className="hover:opacity-80 transition-opacity">
              <Avatar className="h-10 w-10 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <AvatarImage src={user?.avatarUrl || undefined} alt={user?.fullName} />
                <AvatarFallback className="bg-black text-white">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </Link>
            
            <Button
              onClick={logout}
              variant="outline"
              className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
          
        </div>
      </div>
    </nav>
  );
}

/**
 * =======================
 * Navigasi Bawah (Mobile)
 * =======================
 * Ditampilkan HANYA di mobile (block lg:hidden)
 * Berisi 5 item: 3 navItems + Profile (Avatar) + Logout (Button)
 */
function BottomNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const userInitials = user?.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'US';

  // 'block lg:hidden' - HANYA tampil di mobile
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 block border-t-2 border-black bg-white lg:hidden">
      {/* Grid 5 kolom: 3 untuk nav, 1 untuk profile, 1 untuk logout */}
      <div className="grid h-20 grid-cols-5 p-2 items-center justify-around">
        
        {/* Item 1-3: Dashboard, Transactions, Savings */}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center p-2 transition-colors ${
                isActive
                  ? 'text-black' // Warna aktif
                  : 'text-gray-500 hover:text-black' // Warna non-aktif
              }`}
            >
              <Icon className="h-6 w-6" />
              <span className="mt-1 text-xs font-semibold">{item.label}</span>
            </Link>
          );
        })}

        {/* Item 4: Profile (menggunakan Avatar) */}
        <Link
          href="/profile"
          className={`flex flex-col items-center justify-center p-2 transition-colors ${
            pathname.startsWith('/profile')
              ? 'text-black'
              : 'text-gray-500 hover:text-black'
          }`}
        >
          <Avatar className="h-7 w-7 border-2 border-black">
            <AvatarImage src={user?.avatarUrl || undefined} alt={user?.fullName} />
            <AvatarFallback className="bg-black text-white text-xs">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <span className="mt-1 text-xs font-semibold">Profile</span>
        </Link>

        {/* Item 5: Logout (Button) */}
        <button
          type="button"
          onClick={() => logout()}
          className="flex flex-col items-center justify-center p-2 text-gray-500 hover:text-black transition-colors"
        >
          <LogOut className="h-6 w-6" />
          <span className="mt-1 text-xs font-semibold">Logout</span>
        </button>

      </div>
    </nav>
  );
}

/**
 * =======================
 * Komponen Ekspor Utama
 * =======================
 * Merender DesktopNav (hidden-mobile) dan BottomNav (hidden-desktop)
 */
export function Navigation() {
  return (
    <>
      <DesktopNav />
      <BottomNav />
    </>
  );
}