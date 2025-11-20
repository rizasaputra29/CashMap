'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import LogoLoop from '@/components/ui/logo-loop';
import { 
  ArrowRight, 
  Wallet, 
  PieChart, 
  Target, 
  TrendingUp,
  Github,
  Twitter,
  Linkedin,
  Instagram
} from 'lucide-react';
import { motion, Variants } from 'framer-motion';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Animation variants typed explicitly to fix TS errors
  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: "easeOut" } 
    }
  };

  const stagger: Variants = {
    visible: { transition: { staggerChildren: 0.1 } }
  };

  const techStackLogos = [
    { src: "https://cdn.worldvectorlogo.com/logos/next-js.svg", alt: "Next.js", title: "Next.js", width: 100, height: 40 },
    { src: "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg", alt: "React", title: "React", width: 100, height: 40 },
    { src: "https://upload.wikimedia.org/wikipedia/commons/4/4c/Typescript_logo_2020.svg", alt: "TypeScript", title: "TypeScript", width: 100, height: 40 },
    { src: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg", alt: "Tailwind CSS", title: "Tailwind CSS", width: 100, height: 40 },
    { src: "https://cdn.worldvectorlogo.com/logos/prisma-3.svg", alt: "Prisma", title: "Prisma", width: 100, height: 40 },
    { src: "https://upload.wikimedia.org/wikipedia/commons/2/29/Postgresql_elephant.svg", alt: "PostgreSQL", title: "PostgreSQL", width: 100, height: 40 },
    { src: "https://lucide.dev/library-logos/shadcn-ui-dark.svg", alt: "Shadcn UI", title: "Shadcn UI", width: 100, height: 40 },
    { src: "https://cdn.worldvectorlogo.com/logos/framer-motion.svg", alt: "Framer Motion", title: "Framer Motion", width: 100, height: 40 },
  ];

  return (
    <main className="min-h-screen bg-white text-black overflow-x-hidden font-sans selection:bg-[#D2F65E]">
      
      {/* --- HERO SECTION --- */}
      <section className="pt-6 pb-12 px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="max-w-7xl mx-auto bg-[#D2F65E] rounded-[2.5rem] p-8 md:p-16 relative overflow-hidden shadow-xl"
        >
          {/* Decorative Abstract Lines */}
          <div className="absolute top-0 right-0 w-full h-full pointer-events-none opacity-20">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M80 0 Q 50 50 80 100" stroke="black" strokeWidth="0.5" fill="none" />
              <path d="M90 0 Q 60 50 90 100" stroke="black" strokeWidth="0.5" fill="none" />
            </svg>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
            {/* Left: Text */}
            <div className="space-y-8">
              {/* LOGO HEADER */}
              <div className="flex items-center gap-3">
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
              </div>
              
              <div className="space-y-4">
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1]">
                  Master your <br/>
                  <span className="italic font-serif font-normal">money</span> flow.
                </h1>
                
                <p className="text-lg md:text-xl font-medium max-w-md opacity-80 leading-relaxed">
                  Track expenses, set strict budgets, and hit your savings goals. All in one clean, clutter-free dashboard.
                </p>
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link href="/auth/register">
                  <Button className="h-14 px-8 rounded-full bg-black text-white text-lg font-bold hover:scale-105 transition-transform shadow-lg hover:bg-gray-900">
                    Get Started <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button variant="outline" className="h-14 px-8 rounded-full bg-white text-black text-lg font-bold hover:scale-105 transition-transform shadow-lg hover:bg-gray-100">
                    Login
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right: Abstract App Mockup */}
            <div className="relative hidden lg:block h-[500px]">
              {/* Phone 1: Dashboard */}
              <motion.div 
                initial={{ y: 100, opacity: 0, rotate: -10 }}
                animate={{ y: 0, opacity: 1, rotate: -6 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="absolute left-10 top-10 w-72 h-[480px] bg-white rounded-[2.5rem] border-[6px] border-black shadow-2xl p-5 flex flex-col gap-5 z-10"
              >
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full" />
                  <div className="w-24 h-5 bg-gray-100 rounded-full" />
                </div>
                <div className="space-y-2">
                   <p className="text-sm text-gray-400 font-medium">Total Balance</p>
                   <h3 className="text-3xl font-bold">Rp 12.500k</h3>
                </div>
                <div className="h-28 bg-[#D2F65E] rounded-2xl flex items-center justify-center relative overflow-hidden border-2 border-black/5">
                   <TrendingUp className="w-16 h-16 opacity-20 absolute -bottom-3 -right-3" />
                   <span className="font-bold text-lg">+15% Income</span>
                </div>
                <div className="space-y-3 mt-1">
                  {[1,2,3].map(i => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-50 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <div className="w-full h-3 bg-gray-100 rounded-full" />
                        <div className="w-2/3 h-3 bg-gray-100 rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Phone 2: Dark Mode / Savings */}
              <motion.div 
                initial={{ y: 100, opacity: 0, rotate: 10 }}
                animate={{ y: 60, opacity: 1, rotate: 8 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="absolute right-4 top-4 w-64 h-[420px] bg-black text-white rounded-[2.5rem] border-[6px] border-black shadow-2xl p-5 flex flex-col gap-5 z-0"
              >
                 <div className="flex justify-between items-center pb-1">
                  <h4 className="font-bold text-lg">Savings</h4>
                  <Target className="text-[#D2F65E]" />
                </div>
                <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                  <div className="flex justify-between mb-3">
                    <span className="text-sm font-medium">Vacation</span>
                    <span className="text-[#D2F65E] text-sm font-bold">80%</span>
                  </div>
                  <div className="w-full bg-gray-800 h-3 rounded-full overflow-hidden">
                    <div className="bg-[#D2F65E] w-[80%] h-full" />
                  </div>
                </div>
                <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                  <div className="flex justify-between mb-3">
                    <span className="text-sm font-medium">New Laptop</span>
                    <span className="text-[#D2F65E] text-sm font-bold">45%</span>
                  </div>
                  <div className="w-full bg-gray-800 h-3 rounded-full overflow-hidden">
                    <div className="bg-[#D2F65E] w-[45%] h-full" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* --- TECH STACK LOGO LOOP --- */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-12">Powered By Modern Tech Stack</p>
          
          <div className="w-full overflow-hidden grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            <LogoLoop 
              logos={techStackLogos} 
              speed={60} 
              direction="left"
              logoHeight={40}
              gap={40}
              pauseOnHover={true}
              scaleOnHover={true}
              fadeOut={true}
              fadeOutColor="#ffffff"
              ariaLabel="Tech Stack Logos"
            />
          </div>
        </div>
      </section>

      {/* --- FEATURE HIGHLIGHT (DARK CARD) --- */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid lg:grid-cols-2 gap-8 items-center"
          >
            {/* Left: Image/Card */}
            <div className="bg-black text-white rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden min-h-[450px] flex flex-col justify-between shadow-2xl">
               {/* Abstract Chart Background */}
               <div className="absolute inset-0 opacity-20">
                  <svg className="w-full h-full" viewBox="0 0 400 400">
                    <path d="M0 300 C 100 300, 100 100, 200 150 S 300 50, 400 100 L 400 400 L 0 400 Z" fill="#D2F65E" />
                  </svg>
               </div>

               <div className="relative z-10">
                 <div className="inline-block bg-[#D2F65E] text-black px-3 py-1 rounded-full text-sm font-bold mb-6">
                    Analytics Feature
                 </div>
                 <h3 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                    Keep your finger on the Budget Pulse.
                 </h3>
                 <p className="text-gray-400 max-w-sm text-lg">
                    Real-time calculations show you exactly how much you can spend today without breaking your monthly limit.
                 </p>
               </div>

               <div className="relative z-10 mt-8">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 max-w-xs">
                    <p className="text-sm text-gray-300 mb-2">Daily Safe Limit</p>
                    <div className="flex justify-between items-end">
                      <span className="text-3xl font-bold">Rp 150k</span>
                      <div className="flex items-center gap-1 text-[#D2F65E] text-sm font-bold bg-[#D2F65E]/10 px-2 py-1 rounded-lg">
                        <TrendingUp className="w-3 h-3" /> Safe
                      </div>
                    </div>
                  </div>
               </div>
            </div>

            {/* Right: Text Content */}
            <div className="lg:pl-12 py-8">
               <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">Full Analytics of your Money.</h2>
               <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                 Stop guessing where your money goes. CashMap categorizes every rupiah, visualizes your spending habits, and helps you make smarter financial decisions effortlessly.
               </p>
               
               <div className="space-y-8">
                 {[
                    { title: "Smart Categorization", desc: "Automatically sort transactions into Food, Transport, and more." },
                    { title: "Export & Backup", desc: "Your data is yours. Export to JSON anytime for safekeeping." }
                 ].map((item, idx) => (
                   <div key={idx} className="flex gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-[#D2F65E] flex items-center justify-center shrink-0 font-bold text-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                        <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                      </div>
                   </div>
                 ))}
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section className="pb-24 bg-white px-4 sm:px-6 lg:px-8 mt-12 rounded-t-[3rem]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Everything you need</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features packed into a simple interface designed for clarity.
            </p>
          </div>

          <motion.div 
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              { 
                icon: Wallet, 
                title: "Transaction Tracking", 
                desc: "Log income and expenses in seconds. Edit, delete, and view history with ease.",
                color: "bg-white" 
              },
              { 
                icon: PieChart, 
                title: "Budget Control", 
                desc: "Set a date range and total budget. We calculate your daily safe-to-spend limit.",
                color: "bg-white" 
              },
              { 
                icon: Target, 
                title: "Savings Goals", 
                desc: "Visualize your progress towards that new phone, car, or dream vacation.",
                color: "bg-white" 
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                variants={fadeInUp}
                className={`${feature.color} p-10 rounded-[2.5rem] border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-6px] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all duration-300`}
              >
                <div className="w-14 h-14 bg-[#D2F65E] rounded-2xl flex items-center justify-center mb-8 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <feature.icon className="w-7 h-7 text-black" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      {/* --- CTA FOOTER --- */}
      <section className=" text-black py-20 px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          
          <div className="mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <p>&copy; 2025 CashMap. All rights reserved.</p>
            
            {/* Quick Links / Socials */}
            <div className="flex gap-6 mt-4 md:mt-0 items-center">
              <Link href="https://github.com/rizasaputra29" className="hover:text-[#7089ca] transition-colors"><Github className="w-5 h-5" /></Link>
              <Link href="https://www.linkedin.com/in/rizasaputra29/" className="hover:text-[#4f7de8] transition-colors"><Linkedin className="w-5 h-5" /></Link>
              <Link href="https://www.instagram.com/rizasaputra29/" className="hover:text-[#ef4d4d] transition-colors"><Instagram className="w-5 h-5" /></Link>
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}