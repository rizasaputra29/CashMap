'use client';

import { useState, useMemo } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useFinance } from '@/contexts/FinanceContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SimpleProgress } from '@/components/SimpleProgress';
import { Wallet, TrendingUp, TrendingDown, Target, Plus, Calendar, AlertTriangle, XCircle } from 'lucide-react';
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

// ... (Helper calculateDaysDifference tetap sama) ...
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
      toast({ title: 'Error', description: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    const transactionData = {
        type: transactionForm.type,
        amount: parseFloat(transactionForm.amount), 
        category: transactionForm.category,
        description: transactionForm.description,
        date: transactionForm.date,
    }
    try {
        await addTransaction(transactionData);
        toast({ title: 'Success', description: 'Transaction added successfully' });
        setTransactionForm({ ...initialTransactionForm });
        setIsTxnFormOpen(false);
    } catch(e) {
        toast({ title: 'Error', description: 'Failed to save transaction.', variant: 'destructive' });
    }
  };

  const handleTotalBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanedValue = cleanRupiah(e.target.value);
    setBudgetForm({ ...budgetForm, totalBudget: cleanedValue });
  };
  const handleSetBudget = async () => {
    if (!budgetForm.totalBudget || !budgetForm.endDate || !budgetForm.startDate) {
      toast({ title: 'Error', description: 'Please fill Total Budget, Start Date, and End Date', variant: 'destructive' });
      return;
    }
    if (new Date(budgetForm.startDate) > new Date(budgetForm.endDate)) {
        toast({ title: 'Error', description: 'Start date cannot be after end date.', variant: 'destructive' });
        return;
    }
    const daysCount = calculateDaysDifference(budgetForm.startDate, budgetForm.endDate);
    const totalBudgetAmount = parseFloat(budgetForm.totalBudget);
    const initialDailyLimit = daysCount > 0 ? totalBudgetAmount / daysCount : totalBudgetAmount;
    try {
      await setBudgetLimit({
        totalBudget: totalBudgetAmount,
        dailyLimit: initialDailyLimit,
        startDate: budgetForm.startDate,
        endDate: budgetForm.endDate,
        isActive: budgetForm.isActive,
      });
      toast({ title: 'Success', description: 'Budget limit set successfully' });
      setIsBudgetOpen(false);
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to save budget limit.', variant: 'destructive' });
    }
  };
  const handleResetBudget = async () => {
    if (!budgetLimit) return;
    try {
        await resetBudgetLimit();
        toast({ title: 'Budget Reset', description: 'Budget limit has been reset.' });
    } catch(e) {
        toast({ title: 'Error', description: 'Failed to reset budget.', variant: 'destructive' });
    }
  };
  
  const daysCountEstimate = budgetForm.startDate && budgetForm.endDate && new Date(budgetForm.startDate) <= new Date(budgetForm.endDate)
    ? calculateDaysDifference(budgetForm.startDate, budgetForm.endDate)
    : 0;
  const estimatedTotalBudget = parseFloat(budgetForm.totalBudget || '0');
  const estimatedDailyLimit = daysCountEstimate > 0 ? estimatedTotalBudget / daysCountEstimate : 0;

  const totalIncome = useMemo(() => transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0), [transactions]);
  const totalExpenses = useMemo(() => transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0), [transactions]);
  const balance = totalIncome - totalExpenses;
  const todayExpenses = getDailyExpenses(today);
  
  const remainingDailyBudget = getRemainingDailyBudget(today);
  const dynamicDailyLimitForToday = getDynamicDailyLimit(today);
  const adjustedRemainingTotalBudget = getAdjustedRemainingTotalBudget();
  const isBudgetActiveToday = budgetLimit && budgetLimit.isActive && today >= budgetLimit.startDate && today <= budgetLimit.endDate;
  const dailyBudgetExceeded = isBudgetActiveToday && todayExpenses > dynamicDailyLimitForToday && dynamicDailyLimitForToday > 0;
  const activeSavingsGoals = savingsGoals.filter((g) => !g.isCompleted);
  const dailyProgressPercentage = dynamicDailyLimitForToday > 0 ? (todayExpenses / dynamicDailyLimitForToday) * 100 : (todayExpenses > 0 ? 100 : 0);


  return (
    <ProtectedRoute>
      {/* Tambahkan div padding untuk bottom nav */}
      <div className="pb-16 lg:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
              <p className="text-gray-600">Welcome back! Here&apos;s your financial overview.</p>
            </div>
            
            <Dialog open={isTxnFormOpen} onOpenChange={handleTxnDialogChange}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-black text-white hover:bg-gray-800 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all w-10 px-0 sm:w-auto sm:px-4"
                  size="default" 
                >
                  <Plus className="w-4 h-4 mr-0 sm:mr-2" />
                  <span className="hidden sm:inline">Add Transaction</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">
                      Add Transaction
                  </DialogTitle>
                  <DialogDescription>
                      Record a new income or expense.
                  </DialogDescription>
                </DialogHeader>
                <Tabs
                  value={transactionForm.type}
                  onValueChange={(value) =>
                    setTransactionForm({ ...transactionForm, type: value as 'income' | 'expense' })
                  }
                >
                  <TabsList className="grid w-full grid-cols-2 border-2 border-black">
                    <TabsTrigger value="expense" className="font-semibold">
                      Expense
                    </TabsTrigger>
                    <TabsTrigger value="income" className="font-semibold">
                      Income
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value={transactionForm.type} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Amount</Label>
                      <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rp</span>
                          <Input
                            type="text" 
                            placeholder={transactionForm.type === 'income' ? '5.000.000' : '50.000'}
                            value={formatRupiah(parseFloat(transactionForm.amount || '0')).replace('Rp', '').trim()}
                            onChange={handleAmountChange}
                            className="border-2 border-black pl-8 text-right" 
                          />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select
                        value={transactionForm.category}
                        onValueChange={(value) =>
                          setTransactionForm({ ...transactionForm, category: value })
                        }
                      >
                        <SelectTrigger className="border-2 border-black">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="border-2 border-black">
                          {(transactionForm.type === 'expense' ? expenseCategories : incomeCategories).map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={transactionForm.date}
                        onChange={(e) =>
                          setTransactionForm({ ...transactionForm, date: e.target.value })
                        }
                        className="border-2 border-black"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description (Optional)</Label>
                      <Textarea
                        placeholder="Add notes..."
                        value={transactionForm.description}
                        onChange={(e) =>
                          setTransactionForm({ ...transactionForm, description: e.target.value })
                        }
                        className="border-2 border-black"
                      />
                    </div>
                  </TabsContent>
                </Tabs>
                <Button
                  onClick={handleSaveTransaction}
                  className="w-full bg-black text-white hover:bg-gray-800 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                  Add Transaction
                </Button>
              </DialogContent>
            </Dialog>
            
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold text-gray-600">
                  Total Balance
                </CardTitle>
                <Wallet className="w-4 h-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {formatRupiah(balance)}
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold text-gray-600">
                  Total Income
                </CardTitle>
                <TrendingUp className="w-4 h-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {formatRupiah(totalIncome)}
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold text-gray-600">
                  Total Expenses
                </CardTitle>
                <TrendingDown className="w-4 h-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">
                  {formatRupiah(totalExpenses)}
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold text-gray-600">
                  Savings Goals
                </CardTitle>
                <Target className="w-4 h-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{activeSavingsGoals.length}</div>
                <p className="text-xs text-gray-600 mt-1">Active goals</p>
              </CardContent>
            </Card>
          </div>
          
          {dailyBudgetExceeded && (
            <Alert
              variant="destructive"
              className="mb-6 border-2 border-red-600 shadow-[4px_4px_0px_0px_rgba(220,38,38,1)]"
            >
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Warning: Daily Budget Exceeded!</AlertTitle>
              <AlertDescription>
                  Your spending today ({formatRupiah(todayExpenses)}) has exceeded the adjusted daily limit ({formatRupiah(dynamicDailyLimitForToday)}).
              </AlertDescription>
            </Alert>
          )}

          {isBudgetActiveToday && budgetLimit ? (
            <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-8">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                <CardTitle className="text-xl font-bold mb-3 sm:mb-0">Daily Budget Tracker</CardTitle>
                <div className="flex flex-col gap-2 sm:flex-row w-full sm:w-auto">
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleResetBudget}
                        className="bg-red-600 text-white hover:bg-red-700 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all w-full sm:w-auto"
                    >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reset Budget
                    </Button>
                    <Dialog open={isBudgetOpen} onOpenChange={setIsBudgetOpen}>
                      <DialogTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="bg-white text-black hover:bg-gray-100 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all w-full sm:w-auto"
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          Set Budget
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-bold">Set Budget Limit</DialogTitle>
                          <DialogDescription>
                              Set your total budget and the duration.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                          <div className="space-y-2">
                            <Label>Total Budget (for the entire period)</Label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rp</span>
                              <Input
                                type="text"
                                placeholder="3.000.000"
                                value={formatRupiah(estimatedTotalBudget).replace('Rp', '').trim()}
                                onChange={handleTotalBudgetChange}
                                className="border-2 border-black pl-8 text-right"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Start Date</Label>
                              <Input
                                type="date"
                                value={budgetForm.startDate}
                                onChange={(e) =>
                                  setBudgetForm({ ...budgetForm, startDate: e.target.value })
                                }
                                className="border-2 border-black"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>End Date</Label>
                              <Input
                                type="date"
                                value={budgetForm.endDate}
                                onChange={(e) =>
                                  setBudgetForm({ ...budgetForm, endDate: e.target.value })
                                }
                                className="border-2 border-black"
                              />
                            </div>
                          </div>
                          {daysCountEstimate > 0 && estimatedTotalBudget > 0 && (
                            <div className="p-3 border-2 border-dashed border-gray-300 rounded-md bg-gray-50 text-sm">
                              <p className="font-semibold">Initial Daily Limit Estimate:</p>
                              <p className="text-lg font-bold text-black">
                                {formatRupiah(estimatedDailyLimit)}
                                <span className="font-normal text-gray-500 text-sm"> / day ({daysCountEstimate} days)</span>
                              </p>
                            </div>
                          )}
                          <Button
                            onClick={handleSetBudget}
                            className="w-full bg-black text-white hover:bg-gray-800 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                          >
                            Save Budget
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Today&apos;s Spending</p>
                    <p className="text-2xl font-bold">
                      {formatRupiah(todayExpenses)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Today&apos;s Limit (Adjusted)</p>
                    <p className="text-2xl font-bold">
                      {formatRupiah(dynamicDailyLimitForToday)}
                    </p>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-semibold">Remaining Today</span>
                    <span className={`text-sm font-semibold ${remainingDailyBudget < 0 ? 'text-red-600' : ''}`}>
                      {formatRupiah(remainingDailyBudget)}
                    </span>
                  </div>
                  <SimpleProgress
                    value={dailyProgressPercentage}
                    className="h-3 border-2 border-black"
                  />
                </div>
                <div className="text-sm text-gray-600 space-y-1 pt-4 border-t-2 border-dashed border-gray-300">
                    <p>Original Total Budget: <span className="font-semibold">{formatRupiah(budgetLimit.totalBudget)}</span></p>
                    <p className="text-lg font-bold">
                        Remaining Total Budget (Adjusted):
                        <span
                            className={`ml-2 ${adjustedRemainingTotalBudget < 0 ? 'text-red-600' : 'text-green-600'}`}
                        >
                            {formatRupiah(adjustedRemainingTotalBudget)}
                        </span>
                    </p>
                    <p className="text-xs text-gray-500">
                        Budget Period: {new Date(budgetLimit.startDate).toLocaleDateString('id-ID')} -{' '}
                        {new Date(budgetLimit.endDate).toLocaleDateString('id-ID')}
                    </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-8">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Target className="w-12 h-12 mb-4 text-gray-400" />
                <h3 className="text-xl font-bold mb-2">Budget Not Active</h3>
                {budgetLimit && (
                    <p className="text-gray-600 mb-4 text-center">
                        The saved budget ({formatRupiah(budgetLimit.totalBudget)}) is currently inactive.
                        <br/>
                        ({new Date(budgetLimit.startDate).toLocaleDateString('id-ID')} - {new Date(budgetLimit.endDate).toLocaleDateString('id-ID')}).
                    </p>
                )}
                {!budgetLimit && (
                    <p className="text-gray-600 mb-4 text-center">
                        No budget limit is currently set. Define your budget below.
                    </p>
                )}
                <Dialog open={isBudgetOpen} onOpenChange={setIsBudgetOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-black text-white hover:bg-gray-800 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
                      <Plus className="w-4 h-4 mr-2" />
                      Set Budget Limit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold">Set Budget Limit</DialogTitle>
                      <DialogDescription>
                          Set your total budget and the duration.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label>Total Budget (for the entire period)</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rp</span>
                          <Input
                            type="text"
                            placeholder="3.000.000"
                            value={formatRupiah(estimatedTotalBudget).replace('Rp', '').trim()}
                            onChange={handleTotalBudgetChange}
                            className="border-2 border-black pl-8 text-right"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Start Date</Label>
                          <Input
                            type="date"
                            value={budgetForm.startDate}
                            onChange={(e) =>
                              setBudgetForm({ ...budgetForm, startDate: e.target.value })
                            }
                            className="border-2 border-black"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>End Date</Label>
                          <Input
                            type="date"
                            value={budgetForm.endDate}
                            onChange={(e) =>
                              setBudgetForm({ ...budgetForm, endDate: e.target.value })
                            }
                            className="border-2 border-black"
                          />
                        </div>
                      </div>
                      {daysCountEstimate > 0 && estimatedTotalBudget > 0 && (
                        <div className="p-3 border-2 border-dashed border-gray-300 rounded-md bg-gray-50 text-sm">
                          <p className="font-semibold">Initial Daily Limit Estimate:</p>
                          <p className="text-lg font-bold text-black">
                            {formatRupiah(estimatedDailyLimit)}
                            <span className="font-normal text-gray-500 text-sm"> / day ({daysCountEstimate} days)</span>
                          </p>
                        </div>
                      )}
                      <Button
                        onClick={handleSetBudget}
                        className="w-full bg-black text-white hover:bg-gray-800 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                      >
                        Save Budget
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">No transactions yet</p>
                    <Link href="/transactions">
                      <Button className="bg-black text-white hover:bg-gray-800 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Transaction
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions
                      .slice(-5)
                      .reverse()
                      .map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex justify-between items-center p-3 border-2 border-black"
                        >
                          <div>
                            <p className="font-semibold">{transaction.category}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(transaction.date).toLocaleDateString('id-ID')}
                            </p>
                          </div>
                          <div
                            className={`text-lg font-bold ${
                              transaction.type === 'income'
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {transaction.type === 'income' ? '+' : '-'}
                            {formatRupiah(transaction.amount)}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Savings Goals</CardTitle>
              </CardHeader>
              <CardContent>
                {activeSavingsGoals.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">No savings goals yet</p>
                    <Link href="/savings">
                      <Button className="bg-black text-white hover:bg-gray-800 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Goal
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeSavingsGoals.slice(0, 3).map((goal) => (
                      <div key={goal.id} className="p-3 border-2 border-black">
                        <div className="flex justify-between mb-2">
                          <p className="font-semibold">{goal.name}</p>
                          <p className="text-sm font-semibold">
                            {Math.round((goal.currentAmount / goal.targetAmount) * 100)}%
                          </p>
                        </div>
                        <SimpleProgress
                          value={(goal.currentAmount / goal.targetAmount) * 100}
                          className="h-2 border border-black mb-2"
                        />
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>{formatRupiah(goal.currentAmount)}</span>
                          <span>{formatRupiah(goal.targetAmount)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
}