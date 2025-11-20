'use client';

import { useState, useMemo } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useFinance } from '@/contexts/FinanceContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SimpleProgress } from '@/components/SimpleProgress';
import { 
  Wallet, 
  TrendingUp,  
  Target, 
  Plus, 
  Calendar, 
  AlertTriangle, 
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { formatRupiah, cleanRupiah } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

// --- Helpers ---
const calculateDaysDifference = (start: string, end: string): number => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    startDate.setHours(12, 0, 0, 0);
    endDate.setHours(12, 0, 0, 0);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, diffDays);
}

const incomeCategories = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'];
const expenseCategories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Other'];

const initialTransactionForm = {
  id: '',
  type: 'expense' as 'income' | 'expense',
  amount: '',
  category: '',
  description: '',
  date: new Date().toISOString().split('T')[0],
};

export default function DashboardPage() {
  const { 
    transactions, 
    budgetLimit, 
    savingsGoals, 
    getDailyExpenses, 
    getRemainingDailyBudget, 
    setBudgetLimit, 
    getAdjustedRemainingTotalBudget, 
    resetBudgetLimit, 
    getDynamicDailyLimit,
    addTransaction 
  } = useFinance();
  const { toast } = useToast();

  const today = new Date().toISOString().split('T')[0];

  // --- State ---
  const [isBudgetOpen, setIsBudgetOpen] = useState(false);
  const [budgetForm, setBudgetForm] = useState({
    totalBudget: budgetLimit?.totalBudget.toString() || '',
    startDate: budgetLimit?.startDate || new Date().toISOString().split('T')[0],
    endDate: budgetLimit?.endDate || '',
    isActive: budgetLimit?.isActive ?? true,
  });
  
  const [isTxnFormOpen, setIsTxnFormOpen] = useState(false);
  const [transactionForm, setTransactionForm] = useState<typeof initialTransactionForm>({
    ...initialTransactionForm,
  });

  // --- Data Processing ---
  const totalIncome = useMemo(() => transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0), [transactions]);
  const totalExpenses = useMemo(() => transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0), [transactions]);
  const balance = totalIncome - totalExpenses;
  
  const todayExpenses = getDailyExpenses(today);
  const remainingDailyBudget = getRemainingDailyBudget(today);
  const dynamicDailyLimitForToday = getDynamicDailyLimit(today);
  const adjustedRemainingTotalBudget = getAdjustedRemainingTotalBudget();
  
  const isBudgetActiveToday = budgetLimit && budgetLimit.isActive && today >= budgetLimit.startDate && today <= budgetLimit.endDate;
  const dailyBudgetExceeded = isBudgetActiveToday && todayExpenses > dynamicDailyLimitForToday && dynamicDailyLimitForToday > 0;
  const dailyProgressPercentage = dynamicDailyLimitForToday > 0 ? (todayExpenses / dynamicDailyLimitForToday) * 100 : (todayExpenses > 0 ? 100 : 0);
  
  const activeSavingsGoals = savingsGoals.filter(g => !g.isCompleted);

  // --- Handlers ---
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanedValue = cleanRupiah(e.target.value);
    setTransactionForm({ ...transactionForm, amount: cleanedValue });
  };
  
  const handleTxnDialogChange = (open: boolean) => {
    setIsTxnFormOpen(open);
    if (!open) {
      setTransactionForm({ ...initialTransactionForm });
    }
  };

  const handleSaveTransaction = async () => {
    if (!transactionForm.amount || !transactionForm.category) {
      toast({ title: 'Error', description: 'Fill all required fields', variant: 'destructive' });
      return;
    }
    try {
        await addTransaction({
            type: transactionForm.type,
            amount: parseFloat(transactionForm.amount), 
            category: transactionForm.category,
            description: transactionForm.description,
            date: transactionForm.date,
        });
        toast({ title: 'Success', description: 'Transaction added' });
        setTransactionForm({ ...initialTransactionForm });
        setIsTxnFormOpen(false);
    } catch(e) {
        toast({ title: 'Error', description: 'Failed to save.', variant: 'destructive' });
    }
  };

  const handleTotalBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanedValue = cleanRupiah(e.target.value);
    setBudgetForm({ ...budgetForm, totalBudget: cleanedValue });
  };

  const handleSetBudget = async () => {
    if (!budgetForm.totalBudget || !budgetForm.endDate || !budgetForm.startDate) {
      toast({ title: 'Error', description: 'Fill all fields', variant: 'destructive' });
      return;
    }
    const daysCount = calculateDaysDifference(budgetForm.startDate, budgetForm.endDate);
    const totalBudgetAmount = parseFloat(budgetForm.totalBudget);
    try {
      await setBudgetLimit({
        totalBudget: totalBudgetAmount,
        dailyLimit: daysCount > 0 ? totalBudgetAmount / daysCount : totalBudgetAmount,
        startDate: budgetForm.startDate,
        endDate: budgetForm.endDate,
        isActive: budgetForm.isActive,
      });
      toast({ title: 'Success', description: 'Budget set' });
      setIsBudgetOpen(false);
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to save.', variant: 'destructive' });
    }
  };

  const handleResetBudget = async () => {
    if (!budgetLimit) return;
    try {
        await resetBudgetLimit();
        toast({ title: 'Reset', description: 'Budget reset.' });
    } catch(e) {
        toast({ title: 'Error', description: 'Failed to reset.', variant: 'destructive' });
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50/50 pb-24 font-sans selection:bg-[#D2F65E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          
          {/* --- Header Section --- */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">Dashboard</h1>
              <p className="text-sm text-gray-500 font-medium mt-1">Financial overview</p>
            </div>
            
            <Dialog open={isTxnFormOpen} onOpenChange={handleTxnDialogChange}>
              <DialogTrigger asChild>
                <Button className="h-12 rounded-full bg-black text-white font-bold hover:scale-105 transition-transform shadow-md px-6">
                  <Plus className="w-5 h-5 mr-1" /> <span className="hidden sm:inline">New Transaction</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-3xl sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">Add Transaction</DialogTitle>
                  <DialogDescription>Record a new income or expense.</DialogDescription>
                </DialogHeader>
                <Tabs value={transactionForm.type} onValueChange={(v) => setTransactionForm({ ...transactionForm, type: v as 'income'|'expense' })}>
                  <TabsList className="grid w-full grid-cols-2 border-2 border-black rounded-xl p-1 h-auto bg-white">
                    <TabsTrigger value="expense" className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white font-bold py-2">Expense</TabsTrigger>
                    <TabsTrigger value="income" className="rounded-lg data-[state=active]:bg-[#D2F65E] data-[state=active]:text-black font-bold py-2">Income</TabsTrigger>
                  </TabsList>
                  <TabsContent value={transactionForm.type} className="space-y-4 mt-6">
                    <div className="space-y-2">
                      <Label className="font-bold">Amount</Label>
                      <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">Rp</span>
                          <Input
                            type="text" 
                            placeholder="0"
                            value={formatRupiah(parseFloat(transactionForm.amount || '0')).replace('Rp', '').trim()}
                            onChange={handleAmountChange}
                            className="h-12 border-2 border-black rounded-xl pl-10 text-right text-lg font-bold" 
                          />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold">Category</Label>
                      <Select value={transactionForm.category} onValueChange={(v) => setTransactionForm({ ...transactionForm, category: v })}>
                        <SelectTrigger className="h-12 border-2 border-black rounded-xl font-medium">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="border-2 border-black rounded-xl">
                          {(transactionForm.type === 'expense' ? expenseCategories : incomeCategories).map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                        <Label className="font-bold">Date</Label>
                        <Input type="date" value={transactionForm.date} onChange={(e) => setTransactionForm({...transactionForm, date: e.target.value})} className="h-12 border-2 border-black rounded-xl" />
                    </div>
                    <div className="space-y-2">
                        <Label className="font-bold">Description</Label>
                        <Textarea placeholder="Notes..." value={transactionForm.description} onChange={(e) => setTransactionForm({...transactionForm, description: e.target.value})} className="border-2 border-black rounded-xl min-h-[80px]" />
                    </div>
                  </TabsContent>
                </Tabs>
                <Button onClick={handleSaveTransaction} className="w-full h-12 rounded-full bg-black text-white font-bold border-2 border-black hover:bg-gray-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] transition-all">
                  Save Transaction
                </Button>
              </DialogContent>
            </Dialog>
          </div>

          {/* --- Alert for Budget --- */}
          {dailyBudgetExceeded && (
            <Alert variant="destructive" className="mb-6 bg-red-50 border-2 border-red-600 rounded-2xl shadow-sm">
              <AlertTriangle className="h-5 w-5" />
              <AlertTitle className="font-bold">Budget Limit Reached</AlertTitle>
              <AlertDescription className="font-medium text-xs">
                  You&apos;ve exceeded today&apos;s safe limit of {formatRupiah(dynamicDailyLimitForToday)}.
              </AlertDescription>
            </Alert>
          )}

          {/* --- BENTO GRID LAYOUT --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[minmax(160px,auto)]">
            
            {/* 1. Total Balance (Wide) */}
            <Card className="col-span-1 md:col-span-2 lg:col-span-2 bg-[#D2F65E] border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-[2rem] relative overflow-hidden flex flex-col justify-between">
              <CardContent className="p-8 relative z-10 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start">
                    <p className="text-xs font-black uppercase tracking-widest text-black/60">Total Balance</p>
                    <Wallet className="w-6 h-6 opacity-50" />
                </div>
                <div>
                    <h2 className="text-4xl md:text-6xl font-black text-black tracking-tighter">{formatRupiah(balance)}</h2>
                    <p className="text-sm font-bold mt-2 opacity-60">Available funds</p>
                </div>
              </CardContent>
              {/* Decoration */}
              <div className="absolute -right-8 -bottom-12 opacity-10 rotate-12">
                 <Wallet className="w-48 h-48" />
              </div>
            </Card>

            {/* 2. Income (Square) */}
            <Card className="col-span-1 bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-[2rem] hover:-translate-y-1 transition-transform duration-300">
              <CardContent className="p-6 flex flex-col justify-center h-full">
                <div className="flex items-center justify-start space-x-4 mb-4">
                    <div className="bg-green-100 p-2 rounded-xl border-2 border-green-100">
                        <ArrowUpRight className="w-5 h-5 text-green-700" />
                    </div>
                    <p className="text-md font-black uppercase text-gray-400 tracking-wider">Income</p>
                </div>
                <p className="text-2xl md:text-3xl font-black text-black">{formatRupiah(totalIncome)}</p>
              </CardContent>
            </Card>

            {/* 3. Expenses (Square) */}
            <Card className="col-span-1 bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-[2rem] hover:-translate-y-1 transition-transform duration-300">
               <CardContent className="p-6 flex flex-col justify-center h-full">
                <div className="flex items-center justify-start space-x-4 mb-4">
                    <div className="bg-red-100 p-2 rounded-xl border-2 border-red-100">
                        <ArrowDownRight className="w-5 h-5 text-red-700" />
                    </div>
                    <p className="text-md font-black uppercase text-gray-400 tracking-wider">Expenses</p>
                </div>
                <p className="text-2xl md:text-3xl font-black text-black">{formatRupiah(totalExpenses)}</p>
              </CardContent>
            </Card>

            {/* 4. Daily Budget (Tall/Square-ish - 2x2 on desktop) - UPDATED DESIGN */}
            <Card className="col-span-1 md:col-span-2 lg:col-span-2 lg:row-span-2 bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-[2rem] overflow-hidden flex flex-col">
                 <CardHeader className="border-b-2 border-gray-100 bg-gray-50/50 px-8 py-6 flex flex-row items-center justify-between shrink-0">
                    <div className="space-y-1">
                        <CardTitle className="text-xl font-black">Daily Budget</CardTitle>
                        <p className="text-sm text-gray-500 font-medium">Monitor your daily spending limit</p>
                    </div>
                    <div className="flex gap-2">
                        {budgetLimit ? (
                            <Button variant="outline" size="sm" onClick={handleResetBudget} className="rounded-full border-2 border-black hover:bg-red-50 hover:text-red-600 h-9 font-bold">
                                Reset
                            </Button>
                        ) : (
                            <Button size="sm" onClick={() => setIsBudgetOpen(true)} className="rounded-full bg-black text-white font-bold h-9 px-4">
                                Set Budget
                            </Button>
                        )}
                    </div>
                 </CardHeader>
                 
                 <CardContent className="p-8 flex-1 flex flex-col justify-center">
                    {isBudgetActiveToday && budgetLimit ? (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row justify-between items-end gap-2">
                                <div>
                                    <p className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-1">Spent Today</p>
                                    <p className="text-4xl font-black">{formatRupiah(todayExpenses)}</p>
                                </div>
                                <div className="text-left sm:text-right w-full sm:w-auto">
                                    <p className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-1">Daily Limit</p>
                                    <p className="text-2xl font-bold text-black inline-block">{formatRupiah(dynamicDailyLimitForToday)}</p>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold mb-1">
                                    <span>{Math.round(dailyProgressPercentage)}% Used</span>
                                    <span className={remainingDailyBudget < 0 ? 'text-red-600' : 'text-green-600'}>
                                        {remainingDailyBudget < 0 ? 'Over ' : 'Left '}{formatRupiah(Math.abs(remainingDailyBudget))}
                                    </span>
                                </div>
                                <SimpleProgress value={dailyProgressPercentage} className="h-6 border-2 border-black rounded-full bg-gray-100" />
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-dashed border-gray-300">
                                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                                    <p className="text-xs text-gray-500 font-bold">Remaining Today</p>
                                    <p className={`text-lg font-black ${remainingDailyBudget < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        {formatRupiah(remainingDailyBudget)}
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                                    <p className="text-xs text-gray-500 font-bold">Total Remaining</p>
                                    <p className="text-lg font-black">{formatRupiah(adjustedRemainingTotalBudget)}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-black">
                                <Calendar className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">No Active Budget</h3>
                            <p className="text-gray-500 mb-6 max-w-xs mx-auto">Set a budget to track your daily spending limits and save more.</p>
                            {!budgetLimit && (
                                <Button onClick={() => setIsBudgetOpen(true)} className="rounded-full bg-black text-white font-bold px-6">
                                    Create Budget
                                </Button>
                            )}
                        </div>
                    )}
                 </CardContent>
            </Card>

            {/* 5. Recent Transactions List (Tall) */}
            <Card className="col-span-1 md:col-span-1 lg:col-span-1 lg:row-span-2 bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-[2rem] flex flex-col">
                <CardHeader className="px-6 pt-6 pb-4 border-b border-gray-100 flex flex-row items-center justify-between space-y-0 shrink-0">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-black" />
                    <CardTitle className="text-lg font-black">Recent</CardTitle>
                  </div>
                     <Link href="/transactions" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowRight className="w-5 h-5 text-black" />
                     </Link>
                </CardHeader>
                <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
                    {transactions.length === 0 ? (
                         <div className="flex-1 flex flex-col items-center justify-center text-gray-400 min-h-[200px] p-6 text-center">
                            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                                <CreditCard className="w-6 h-6 opacity-40" />
                            </div>
                            <p className="text-xs font-medium">No transactions yet</p>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto">
                             {/* Show only top 5 newest */}
                             {transactions.slice(0, 5).map((t) => (
                                 <div key={t.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                                      <div className="flex items-center gap-3 overflow-hidden">
                                          <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center border-2 border-black ${t.type === 'income' ? 'bg-[#D2F65E]' : 'bg-white'}`}>
                                              {t.type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                                          </div>
                                          <div className="min-w-0">
                                              <p className="font-bold text-sm truncate">{t.category}</p>
                                              <p className="text-[10px] font-medium text-gray-500 uppercase">{new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                                          </div>
                                      </div>
                                      <span className={`font-black text-sm whitespace-nowrap ${t.type === 'income' ? 'text-green-600' : 'text-black'}`}>
                                          {t.type === 'income' ? '+' : '-'}{formatRupiah(t.amount).replace('Rp', '')}
                                      </span>
                                 </div>
                             ))}
                        </div>
                    )}
                </CardContent>
                <div className="p-4 border-t border-gray-100 shrink-0">
                    <Button variant="outline" className="w-full h-10 rounded-xl border-2 border-dashed border-gray-300 text-gray-400 hover:border-black hover:text-black hover:bg-white font-bold text-xs uppercase tracking-wide" onClick={() => setIsTxnFormOpen(true)}>
                        <Plus className="w-3 h-3 mr-2" /> Quick Add
                    </Button>
                </div>
            </Card>

            {/* 6. Savings Goals List (Tall) - UPDATED DESIGN: White Theme */}
             <Card className="col-span-1 md:col-span-1 lg:col-span-1 lg:row-span-2 bg-white text-black border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-[2rem] flex flex-col">
               <CardHeader className="px-6 pt-6 pb-4 border-b border-gray-100 flex flex-row items-center justify-between space-y-0 shrink-0">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-black" />
                    <CardTitle className="text-lg font-black">Goals</CardTitle>
                  </div>
                  <Link href="/savings" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowRight className="w-5 h-5 text-black" />
                  </Link>
               </CardHeader>
               <CardContent className="p-0 flex-1 flex flex-col">
                    {activeSavingsGoals.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 min-h-[200px] p-6 text-center">
                            <p className="text-xs font-medium">No active goals</p>
                            <Link href="/savings" className="mt-4 text-black text-xs font-bold hover:underline">Create one</Link>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {activeSavingsGoals.slice(0, 4).map((goal) => (
                                <div key={goal.id} className="bg-white rounded-2xl p-4 border-2 border-black">
                                    <div className="flex justify-between mb-2">
                                        <span className="font-bold text-sm text-black truncate">{goal.name}</span>
                                        <span className="font-bold text-xs text-black">{Math.round((goal.currentAmount / goal.targetAmount) * 100)}%</span>
                                    </div>
                                    <SimpleProgress value={(goal.currentAmount / goal.targetAmount) * 100} className="h-1.5 border border-black bg-gray-100" />
                                    <div className="mt-2 flex justify-between items-end">
                                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">Saved</span>
                                        <span className="text-xs font-bold text-black">{formatRupiah(goal.currentAmount).replace('Rp', '')}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
               </CardContent>
               <div className="p-6 border-t border-gray-100 shrink-0">
                    <div className="flex justify-between items-end">
                        <div className="text-gray-400 text-xs font-bold uppercase tracking-wide">Total Active</div>
                        <div className="text-3xl font-black text-black">{activeSavingsGoals.length}</div>
                    </div>
               </div>
            </Card>

            {/* Dialogs for Budget are handled by state at the top */}
            {isBudgetOpen && (
                 <Dialog open={isBudgetOpen} onOpenChange={setIsBudgetOpen}>
                 <DialogContent className="border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-3xl">
                     <DialogHeader><DialogTitle className="text-xl font-bold">Configure Budget</DialogTitle></DialogHeader>
                     <div className="space-y-4 mt-4">
                         <div className="space-y-2">
                             <Label className="font-bold">Total Budget</Label>
                             <Input placeholder="3.000.000" value={formatRupiah(parseFloat(budgetForm.totalBudget || '0')).replace('Rp', '').trim()} onChange={handleTotalBudgetChange} className="border-2 border-black rounded-xl h-12 font-bold" />
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2"><Label className="font-bold">Start</Label><Input type="date" value={budgetForm.startDate} onChange={(e) => setBudgetForm({...budgetForm, startDate: e.target.value})} className="border-2 border-black rounded-xl" /></div>
                             <div className="space-y-2"><Label className="font-bold">End</Label><Input type="date" value={budgetForm.endDate} onChange={(e) => setBudgetForm({...budgetForm, endDate: e.target.value})} className="border-2 border-black rounded-xl" /></div>
                         </div>
                         <Button onClick={handleSetBudget} className="w-full h-12 rounded-full bg-black text-white font-bold">Save</Button>
                     </div>
                 </DialogContent>
             </Dialog>
            )}

          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}