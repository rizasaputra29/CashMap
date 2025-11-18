// rizasaputra29/financial-tracker/Financial-Tracker-6ef0fa1fb6903e1bd873f45840a83116c489026f/app/auth/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Wallet, Mail, Send, Key } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // State untuk Forgot Password
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSecurityAnswer, setForgotSecurityAnswer] = useState('');
  // BARU: State untuk password baru
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
      toast({
        title: 'Login successful',
        description: 'Welcome back!',
      });
      router.push('/dashboard');
    } else {
      toast({
        title: 'Login failed',
        description: 'Invalid email or password',
        variant: 'destructive',
      });
    }

    setIsLoading(false);
  };
  
  // HANDLER BARU: Submit Forgot Password dengan Password Baru
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
        toast({
            title: 'Error',
            description: 'New password must be at least 6 characters long.',
            variant: 'destructive',
        });
        return;
    }

    setIsSendingReset(true);

    // Kirim email, jawaban keamanan, dan password baru
    const success = await forgotPassword(forgotEmail, forgotSecurityAnswer, newPassword);

    if (success) {
      toast({
        title: 'Success',
        description: 'Your password has been reset successfully. Please login.',
      });
    } else {
      toast({
        title: 'Reset Failed',
        description: 'Verification failed. Please check your email and security answer.',
        variant: 'destructive',
      });
    }

    setIsSendingReset(false);
    setIsForgotOpen(false);
    setForgotEmail('');
    setForgotSecurityAnswer(''); 
    setNewPassword(''); // Bersihkan field
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <Card className="w-full max-w-md border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <Link href="/">
                <Image className='rounded-xl' src="/apple-touch-icon.png" alt="Wallet Icon" width={64} height={64} />
            </Link>
          </div>
          <CardTitle className="text-3xl font-bold">CashMap</CardTitle>
          <CardDescription className="text-base">
            Login to manage your finances
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-2 border-black"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-2 border-black"
              />
            </div>
            {/* Forgot Password Link & Dialog */}
            <div className="flex justify-end text-sm">
                <Dialog open={isForgotOpen} onOpenChange={setIsForgotOpen}>
                    <DialogTrigger asChild>
                        <button type="button" className="text-gray-600 hover:text-black underline transition-colors">
                            Forgot Password?
                        </button>
                    </DialogTrigger>
                    <DialogContent className="border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold">Reset Kata Sandi</DialogTitle>
                            <DialogDescription>
                                Masukkan email, jawaban keamanan, dan kata sandi baru Anda.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleForgotPassword} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="forgotEmail" className="flex items-center gap-2">
                                    <Mail className="w-4 h-4" /> Email
                                </Label>
                                <Input
                                    id="forgotEmail"
                                    type="email"
                                    placeholder="your@email.com"
                                    value={forgotEmail}
                                    onChange={(e) => setForgotEmail(e.target.value)}
                                    required
                                    className="border-2 border-black"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="forgotSecurityAnswer" className="flex items-center gap-2">
                                    <Key className="w-4 h-4" /> Mother's Maiden Name
                                </Label>
                                <Input
                                    id="forgotSecurityAnswer"
                                    type="text"
                                    placeholder="Jawaban harus sama persis"
                                    value={forgotSecurityAnswer}
                                    onChange={(e) => setForgotSecurityAnswer(e.target.value)}
                                    required
                                    className="border-2 border-black"
                                />
                            </div>
                            {/* BARU: Input untuk Password Baru */}
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">New Password (min 6 characters)</Label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="border-2 border-black"
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-black text-white hover:bg-gray-800 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                                disabled={isSendingReset}
                            >
                                {isSendingReset ? (
                                    <>
                                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                      Resetting...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4 mr-2" />
                                        Reset Password
                                    </>
                                )}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
            
            <Button
              type="submit"
              className="w-full bg-black text-white hover:bg-gray-800 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Don't have an account?{' '}
            <Link href="/auth/register" className="underline font-semibold hover:text-gray-600">
              Register
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}