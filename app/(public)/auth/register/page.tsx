'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { motion, Variants } from 'framer-motion';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await register(email, password, fullName, securityAnswer);

    if (success) {
      toast({ title: 'Registration successful', description: 'Account created! Redirecting...' });
      router.push('/dashboard');
    } else {
      toast({ title: 'Registration failed', description: 'Email already exists', variant: 'destructive' });
    }
    setIsLoading(false);
  };

  // Animation Variants
  // Green Panel: Starts from Left (-100%), slides to Right (0)
  const slideVariant: Variants = {
    initial: { x: "-100%" },
    animate: { x: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
  };

  // Form Panel: Starts from Right (100%), slides to Left (0) - Opposite direction
  const formVariant: Variants = {
    initial: { x: "100%" },
    animate: { x: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4 lg:p-8 font-sans selection:bg-[#D2F65E]">
      {/* Main Container */}
      <div className="w-full max-w-5xl grid lg:grid-cols-2 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white rounded-[2.5rem] overflow-hidden lg:h-[700px]">
        
        {/* LEFT SIDE: REGISTER FORM */}
        {/* Updated: bg-[#D2F65E] on mobile, bg-white on desktop */}
        <motion.div 
            className="p-8 md:p-16 flex flex-col justify-center h-full order-2 lg:order-1 relative bg-[#D2F65E] lg:bg-white overflow-hidden"
            variants={formVariant}
            initial="initial"
            animate="animate"
        >
          
          {/* Mobile Only: Background Decoration */}
          <div className="absolute top-0 right-0 w-full h-full pointer-events-none opacity-20 lg:hidden">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M80 0 Q 50 50 80 100" stroke="black" strokeWidth="0.5" fill="none" />
              <path d="M90 0 Q 60 50 90 100" stroke="black" strokeWidth="0.5" fill="none" />
            </svg>
          </div>

          {/* Back Button (Visible on both Mobile and Desktop) */}
          <div className="absolute top-6 left-6 z-30">
            <Link href="/" className="flex items-center justify-center w-8 h-8 bg-white rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-none transition-all">
               <ArrowLeft className="w-6 h-6 text-black" />
            </Link>
          </div>

          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-4 relative z-10 mt-12">
            <Link href="/">
                <div className="relative w-16 h-16 bg-white rounded-xl flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                   <Image 
                     src="/apple-touch-icon.png" 
                     alt="CashMap Logo" 
                     width={60} 
                     height={60} 
                     className="object-cover"
                   />
                </div>
            </Link>
          </div>

          <div className="max-w-sm mx-auto w-full relative z-10">
            <div className="text-center lg:text-left mb-6">
              <h1 className="text-4xl font-black text-black mb-2">Create Account</h1>
              <p className="text-black/70 lg:text-gray-500 font-bold lg:font-medium">Start tracking your finances today</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="font-bold text-black">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="h-11 border-2 border-black rounded-xl focus-visible:ring-0 focus-visible:border-black bg-white focus:bg-white transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="font-bold text-black">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 border-2 border-black rounded-xl focus-visible:ring-0 focus-visible:border-black bg-white focus:bg-white transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="font-bold text-black">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-11 border-2 border-black rounded-xl focus-visible:ring-0 focus-visible:border-black bg-white focus:bg-white transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="securityAnswer" className="font-bold text-black">Security: Mother&apos;s Maiden Name</Label>
                <Input
                  id="securityAnswer"
                  type="text"
                  placeholder="For password recovery"
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                  required
                  className="h-11 border-2 border-black rounded-xl focus-visible:ring-0 focus-visible:border-black bg-white focus:bg-white transition-colors"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 mt-4 text-lg font-bold rounded-full bg-black text-white hover:bg-gray-800 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] transition-all"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : 'Sign Up'}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-black/70 lg:text-gray-500 font-medium">
                Already have an account?{' '}
                <Link href="/auth/login" className="font-bold text-black underline decoration-2 underline-offset-4 hover:text-gray-700 inline-flex items-center gap-1">
                  Login
                </Link>
              </p>
            </div>
          </div>
        </motion.div>

        {/* RIGHT SIDE: GREEN VISUAL PANEL (Sliding - Desktop Only) */}
        <motion.div 
          className="relative hidden lg:flex flex-col justify-between bg-[#D2F65E] text-black p-12 border-l-2 border-black h-full order-1 lg:order-2"
          variants={slideVariant}
          initial="initial"
          animate="animate"
        >
          {/* Desktop Decoration */}
          <div className="absolute top-0 right-0 w-full h-full pointer-events-none opacity-20">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M80 0 Q 50 50 80 100" stroke="black" strokeWidth="0.5" fill="none" />
              <path d="M90 0 Q 60 50 90 100" stroke="black" strokeWidth="0.5" fill="none" />
            </svg>
          </div>

          <div className="relative z-10 text-right">
             <div className="flex items-center justify-end gap-3 group">
                <span className="text-2xl font-bold tracking-tight">CashMap</span>
                <Link href="/">
                  <div className="relative w-10 h-10 bg-white rounded-xl flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                    <Image 
                      src="/apple-touch-icon.png" 
                      alt="CashMap Logo" 
                      width={40} 
                      height={40} 
                      className="object-cover"
                    />
                </div>
                </Link>
             </div>
             <div className="mt-12">
                <h2 className="text-5xl font-extrabold leading-tight mb-4">Join the Club</h2>
                <p className="text-lg font-medium opacity-80 ml-auto max-w-xs">
                  Take control of your financial future with the smartest tracking tool.
                </p>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}