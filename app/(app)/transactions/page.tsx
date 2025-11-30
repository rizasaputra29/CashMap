'use client';

import { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, TrendingUp, TrendingDown, Edit, X, Calendar as CalendarIcon, Filter, Search } from 'lucide-react';
import { formatRupiah, cleanRupiah } from '@/lib/utils';
import Link from 'next/link';

export default function TransactionsPage() {
  const { transactions, addTransaction, deleteTransaction } = useFinance();
  const { toast } = useToast();

  const [isAddTxnOpen, setIsAddTxnOpen] = useState(false);
  const [transactionForm, setTransactionForm] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });
  
  const incomeCategories = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'];
  // 'Savings' category added here
  const expenseCategories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Savings', 'Other'];

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanedValue = cleanRupiah(e.target.value);
    setTransactionForm({ ...transactionForm, amount: cleanedValue });
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
        setTransactionForm({
          type: 'expense', amount: '', category: '', description: '', date: new Date().toISOString().split('T')[0],
        });
        setIsAddTxnOpen(false);
    } catch(e) {
        toast({ title: 'Error', description: 'Failed to save transaction.', variant: 'destructive' });
    }
  };

  const handleDeleteTransaction = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault(); 
    
    try {
      await deleteTransaction(id);
      toast({ title: 'Success', description: 'Transaction deleted' });
    } catch(e) {
      toast({ title: 'Error', description: 'Failed to delete transaction.', variant: 'destructive' });
    }
  };

  const filteredTransactions = transactions
    .filter(t => {
      if (dateFilter.startDate && t.date < dateFilter.startDate) return false;
      if (dateFilter.endDate && t.date > dateFilter.endDate) return false;
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const clearFilters = () => {
    setDateFilter({ startDate: '', endDate: '' });
  };
  
  return (
      <div className="min-h-screen bg-gray-50/50 pb-24 font-sans selection:bg-[#D2F65E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">Transactions</h1>
              <p className="text-sm text-gray-500 font-medium mt-1">Manage your income and expenses</p>
            </div>
            <Dialog open={isAddTxnOpen} onOpenChange={setIsAddTxnOpen}>
                <DialogTrigger asChild>
                  <Button className="h-12 px-8 rounded-full bg-black text-white font-bold hover:scale-105 transition-transform shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
                    <Plus className="w-5 h-5 mr-2" /> Add New
                  </Button>
                </DialogTrigger>
                <DialogContent className="border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-3xl sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Add Transaction</DialogTitle>
                    <DialogDescription>Record a new income or expense.</DialogDescription>
                  </DialogHeader>
                  <Tabs
                    value={transactionForm.type}
                    onValueChange={(value) =>
                      setTransactionForm({ ...transactionForm, type: value as 'income' | 'expense' })
                    }
                  >
                    <TabsList className="grid w-full grid-cols-2 border-2 border-black rounded-xl p-1 h-auto bg-white">
                      <TabsTrigger value="expense" className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white font-bold py-2">Expense</TabsTrigger>
                      <TabsTrigger value="income" className="rounded-lg data-[state=active]:bg-[#D2F65E] data-[state=active]:text-black font-bold py-2">Income</TabsTrigger>
                    </TabsList>
                    <TabsContent value={transactionForm.type} className="space-y-4 mt-6">
                      <div className="space-y-2">
                        <Label className="font-bold">Amount</Label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-lg">Rp</span>
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
                        <Select
                          value={transactionForm.category}
                          onValueChange={(value) =>
                            setTransactionForm({ ...transactionForm, category: value })
                          }
                        >
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

          {/* Filter Section */}
          <div className="mb-8 bg-[#D2F65E] border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-[2rem] p-6 md:p-8 relative overflow-hidden">
              <div className="flex flex-col md:flex-row items-end gap-6 relative z-10">
                <div className="flex items-center gap-3 w-full md:w-auto mb-2 md:mb-0">
                    <div className="bg-black p-2 rounded-xl">
                         <Filter className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-black text-2xl tracking-tight text-black">Filter</span>
                </div>
                <div className="grid grid-cols-2 gap-4 flex-1 w-full">
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-xs font-black text-black/60 uppercase tracking-wider">From Date</Label>
                    <Input 
                      id="startDate"
                      type="date" 
                      value={dateFilter.startDate}
                      onChange={(e) => setDateFilter({...dateFilter, startDate: e.target.value})}
                      className="h-12 border-2 border-black rounded-xl font-bold bg-white focus:ring-black/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-xs font-black text-black/60 uppercase tracking-wider">To Date</Label>
                    <Input 
                      id="endDate"
                      type="date" 
                      value={dateFilter.endDate}
                      onChange={(e) => setDateFilter({...dateFilter, endDate: e.target.value})}
                      className="h-12 border-2 border-black rounded-xl font-bold bg-white focus:ring-black/10"
                    />
                  </div>
                </div>
                {(dateFilter.startDate || dateFilter.endDate) && (
                  <Button 
                    onClick={clearFilters}
                    className="h-12 px-6 rounded-xl bg-white border-2 border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 font-black uppercase tracking-wide shadow-sm"
                  >
                    <X className="w-5 h-5 mr-2" /> Clear
                  </Button>
                )}
              </div>
              
              <div className="absolute -right-6 -bottom-10 opacity-10">
                 <Filter className="w-40 h-40" />
              </div>
          </div>

          {/* Transaction List */}
          <div className="space-y-4">
            {filteredTransactions.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-gray-300 rounded-[2rem] p-12 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold mb-1">No transactions found</h3>
                  <p className="text-gray-500 text-sm">Try adjusting your filters or add a new one.</p>
                </div>
            ) : (
                filteredTransactions.map((transaction) => (
                    <Link href={`/transactions/${transaction.id}`} key={transaction.id} className="block group">
                        <Card className="border-2 border-black shadow-sm hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all duration-300 rounded-[1.5rem] overflow-hidden">
                            <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 border-black shrink-0 ${transaction.type === 'income' ? 'bg-[#D2F65E]' : 'bg-white'}`}>
                                        {transaction.type === 'income' ? <TrendingUp className="w-6 h-6 text-black" /> : <TrendingDown className="w-6 h-6 text-black" />}
                                    </div>
                                    <div>
                                        <p className="font-black text-lg">{transaction.category}</p>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                                            <CalendarIcon className="w-3 h-3" />
                                            {new Date(transaction.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </div>
                                        {transaction.description && (
                                            <p className="text-xs text-gray-400 mt-1 line-clamp-1">{transaction.description}</p>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-0 border-gray-100 pt-4 sm:pt-0">
                                    <span className={`text-xl font-black ${transaction.type === 'income' ? 'text-green-600' : 'text-black'}`}>
                                        {transaction.type === 'income' ? '+' : '-'} {formatRupiah(transaction.amount).replace('Rp', 'Rp ')}
                                    </span>
                                    
                                    <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                        <div className="h-9 w-9 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-black hover:bg-black hover:text-white transition-colors">
                                            <Edit className="w-4 h-4" />
                                        </div>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-9 w-9 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors"
                                            onClick={(e) => handleDeleteTransaction(e, transaction.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))
            )}
          </div>

        </div>
      </div>
  );
}