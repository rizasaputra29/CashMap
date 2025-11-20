'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { LayoutDashboard, TrendingUp, Target, LogOut } from 'lucide-react';

// --- Nav Items ---
const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: TrendingUp },
  { href: '/savings', label: 'Savings', icon: Target },
];

/**
 * =======================
 * Desktop Navigation
 * =======================
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

  return (
    <nav className="hidden lg:flex border-b-2 border-black bg-white/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between h-20 items-center">
          
          {/* Left: Logo & Links */}
          <div className="flex items-center gap-8">
            
            {/* Logo: Styled to match Landing Page */}
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <span className="font-black text-xl tracking-tight">CashMap</span>
            </Link>

            {/* Navigation Links: Pill Shaped */}
            <div className="flex gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      inline-flex items-center px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 border-2
                      ${isActive 
                        ? 'bg-black text-[#D2F65E] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.2)] translate-y-[-1px]' 
                        : 'bg-transparent text-gray-600 border-transparent hover:bg-gray-100 hover:border-black/10'
                      }
                    `}
                  >
                    <Icon className={`w-4 h-4 mr-2 ${isActive ? 'text-[#D2F65E]' : 'text-gray-500'}`} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right: Profile & Logout */}
          <div className="flex items-center gap-4">
            <Link href="/profile">
              <div className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full border-2 border-transparent hover:border-black hover:bg-gray-50 transition-all cursor-pointer group">
                <span className="text-sm font-bold hidden xl:block group-hover:text-black text-gray-600">
                    {user?.fullName.split(' ')[0]}
                </span>
                <Avatar className="h-9 w-9 border-2 border-black shadow-sm">
                    <AvatarImage src={user?.avatarUrl || undefined} alt={user?.fullName} className="object-cover" />
                    <AvatarFallback className="bg-[#D2F65E] text-black font-bold text-xs">
                    {userInitials}
                    </AvatarFallback>
                </Avatar>
              </div>
            </Link>
            
            <Button
              onClick={logout}
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-red-50 hover:text-red-600 transition-colors w-10 h-10"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
          
        </div>
      </div>
    </nav>
  );
}

/**
 * =======================
 * Mobile Navigation
 * =======================
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

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 block border-t-2 border-black bg-white lg:hidden pb-safe">
      <div className="grid h-16 grid-cols-5 items-center justify-around px-2 gap-1">
        
        {/* Nav Items */}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center h-full w-full"
            >
              <div className={`
                flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-200
                ${isActive ? 'bg-black text-[#D2F65E] shadow-md translate-y-[-4px]' : 'text-gray-400 hover:bg-gray-50 hover:text-black'}
              `}>
                <Icon className="h-5 w-5" strokeWidth={isActive ? 3 : 2} />
              </div>
            </Link>
          );
        })}

        {/* Profile Link */}
        <Link
          href="/profile"
          className="flex flex-col items-center justify-center h-full w-full"
        >
           <div className={`
                flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-200
                ${pathname.startsWith('/profile') 
                  ? 'bg-black p-1 shadow-md translate-y-[-4px]' 
                  : 'p-1 hover:bg-gray-50'}
              `}>
            <Avatar className={`h-8 w-8 border-2 ${pathname.startsWith('/profile') ? 'border-[#D2F65E]' : 'border-black'}`}>
                <AvatarImage src={user?.avatarUrl || undefined} alt={user?.fullName} className="object-cover" />
                <AvatarFallback className="bg-[#D2F65E] text-black text-[10px] font-black">
                {userInitials}
                </AvatarFallback>
            </Avatar>
          </div>
        </Link>

        {/* Logout */}
        <button
          type="button"
          onClick={() => logout()}
          className="flex flex-col items-center justify-center h-full w-full"
        >
          <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all">
            <LogOut className="h-5 w-5" strokeWidth={2} />
          </div>
        </button>

      </div>
    </nav>
  );
}

export function Navigation() {
  return (
    <>
      <DesktopNav />
      <BottomNav />
    </>
  );
}