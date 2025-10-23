// rizasaputra29/financial-tracker/Financial-Tracker-0a52692d7585f44ca69d1c37ee19ceebe63135d4/app/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext'; //
import { Wallet, TrendingUp, Target, Shield } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button'; //
import Image from 'next/image';

export default function Home() {
  const { user, isLoading } = useAuth(); //
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  // Loading state remains the same
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg font-semibold">Loading...</p>
        </div>
      </div>
    );
  }


  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center min-h-screen py-12">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="p-4 items-center bg-black rounded-2xl">
                <Image src="/apple-touch-icon.png" alt="Wallet Icon" width={80} height={80} />
              </div>
            </div>
             {/* *** UPDATE: App name *** */}
            <h1 className="text-6xl font-bold mb-4">Cash Map</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Take control of your finances with smart tracking, budgeting, and savings goals
            </p>
          </div>

          {/* Buttons remain the same */}
          <div className="flex gap-4 mb-16">
            <Link href="/auth/register">
              <Button className="text-lg px-8 py-6 bg-black text-white hover:bg-gray-800 border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all">
                Get Started
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button
                variant="outline"
                className="text-lg px-8 py-6 border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                Login
              </Button>
            </Link>
          </div>

          {/* Feature cards remain the same */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl">
            {/* ... feature cards ... */}
            <div className="p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
              <div className="p-3 bg-black rounded-lg w-fit mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Track Transactions</h3>
              <p className="text-gray-600">
                Monitor your income and expenses with detailed categorization and history
              </p>
            </div>

            <div className="p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
              <div className="p-3 bg-black rounded-lg w-fit mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Budget Control</h3>
              <p className="text-gray-600">
                Set daily spending limits and stay on track with your budget goals
              </p>
            </div>

            <div className="p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
              <div className="p-3 bg-black rounded-lg w-fit mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Savings Goals</h3>
              <p className="text-gray-600">
                Create multiple savings targets and track your progress towards each goal
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}