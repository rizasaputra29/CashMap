'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Loader2, ArrowLeft } from 'lucide-react';
import { motion, Variants } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Forgot Password States
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSecurityAnswer, setForgotSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState(''); 
  const [isSendingReset, setIsSendingReset] = useState(false);

  const { login, forgotPassword } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await login(email, password);
    if (success) {
      toast({ title: 'Login successful', description: 'Welcome back to CashMap!' });
      router.push('/dashboard');
    } else {
      toast({ title: 'Login failed', description: 'Invalid email or password', variant: 'destructive' });
    }
    setIsLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
        toast({ title: 'Error', description: 'New password must be at least 6 characters long.', variant: 'destructive' });
        return;
    }
    setIsSendingReset(true);
    const success = await forgotPassword(forgotEmail, forgotSecurityAnswer, newPassword);
    if (success) {
      toast({ title: 'Success', description: 'Password reset successfully. Please login.' });
      setIsForgotOpen(false);
    } else {
      toast({ title: 'Reset Failed', description: 'Verification failed. Check your details.', variant: 'destructive' });
    }
    setIsSendingReset(false);
  };

  // Animation Variants
  // Green Panel: Starts from Right (100%), slides to Left (0)
  const slideVariant: Variants = {
    initial: { x: "100%" },
    animate: { x: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
  };

  // Form Panel: Starts from Left (-100%), slides to Right (0) - Opposite direction
  const formVariant: Variants = {
    initial: { x: "-100%" },
    animate: { x: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4 lg:p-8 font-sans selection:bg-[#D2F65E]">
      {/* Main Container */}
      <div className="w-full max-w-5xl grid lg:grid-cols-2 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white rounded-[2.5rem] overflow-hidden lg:h-[700px]">
        
        {/* LEFT SIDE: GREEN VISUAL PANEL (Desktop Only) */}
        <motion.div 
          className="relative hidden lg:flex flex-col justify-between bg-[#D2F65E] text-black p-12 border-r-2 border-black h-full z-20"
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

          <div className="relative z-10">
             <Link href="/" className="flex items-center gap-3 group">
                <div className="relative w-10 h-10 bg-white rounded-xl flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                   <Image 
                     src="/apple-touch-icon.png" 
                     alt="CashMap Logo" 
                     width={40} 
                     height={40} 
                     className="object-cover"
                   />
                </div>
                <span className="text-2xl font-bold tracking-tight">CashMap</span>
             </Link>
             <div className="mt-12">
                <h2 className="text-5xl font-extrabold leading-tight mb-4">Welcome Back!</h2>
                <p className="text-lg font-medium opacity-80 max-w-xs">
                  Continue your journey to financial freedom. Your dashboard is waiting.
                </p>
             </div>
          </div>
        </motion.div>

        {/* RIGHT SIDE: LOGIN FORM */}
        <motion.div 
            className="p-8 md:p-16 flex flex-col justify-center h-full relative bg-[#D2F65E] lg:bg-white overflow-hidden"
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
            <div className="text-center lg:text-left mb-8">
              <h1 className="text-4xl font-black text-black mb-2">Login</h1>
              <p className="text-black/70 lg:text-gray-500 font-bold lg:font-medium">Enter your details to access your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-bold text-black">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 border-2 border-black rounded-xl focus-visible:ring-0 focus-visible:border-black bg-white focus:bg-white transition-colors"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="font-bold text-black">Password</Label>
                    <Dialog open={isForgotOpen} onOpenChange={setIsForgotOpen}>
                        <DialogTrigger asChild>
                            <button type="button" className="text-xs font-bold text-black/70 lg:text-gray-500 hover:text-black underline decoration-2 underline-offset-2">
                                Forgot Password?
                            </button>
                        </DialogTrigger>
                        <DialogContent className="border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold">Reset Password</DialogTitle>
                                <DialogDescription>Verify your identity to reset access.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleForgotPassword} className="space-y-4 mt-4">
                                <div className="space-y-2">
                                    <Label className="font-bold">Email</Label>
                                    <Input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required className="border-2 border-black rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold">Mother&apos;s Maiden Name</Label>
                                    <Input type="text" value={forgotSecurityAnswer} onChange={(e) => setForgotSecurityAnswer(e.target.value)} required className="border-2 border-black rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold">New Password</Label>
                                    <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} className="border-2 border-black rounded-xl" />
                                </div>
                                <Button type="submit" disabled={isSendingReset} className="w-full h-12 rounded-full bg-black text-white hover:bg-gray-800 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
                                    {isSendingReset ? 'Resetting...' : 'Confirm Reset'}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 border-2 border-black rounded-xl focus-visible:ring-0 focus-visible:border-black bg-white focus:bg-white transition-colors"
                />
              </div>
              
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 text-lg font-bold rounded-full bg-black text-white hover:bg-gray-800 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] transition-all"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : 'Sign In'}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-black/70 lg:text-gray-500 font-medium">
                Don&apos;t have an account?{' '}
                <Link href="/auth/register" className="font-bold text-black underline decoration-2 underline-offset-4 hover:text-gray-700 inline-flex items-center gap-1">
                  Register
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}