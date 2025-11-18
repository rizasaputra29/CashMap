'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useFinance, Transaction } from '@/contexts/FinanceContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
// Menambahkan ikon X (untuk clear filter) dan Filter
import { Plus, Trash2, TrendingUp, TrendingDown, Edit, X, Calendar as CalendarIcon } from 'lucide-react';
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

  // --- BARU: State untuk Filter Tanggal ---
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });
  
  const incomeCategories = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'];
  const expenseCategories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Other'];

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
      toast({
        title: 'Success',
        description: 'Transaction deleted',
      });
    } catch(e) {
      toast({
          title: 'Error',
          description: 'Failed to delete transaction. Please check server connection.',
          variant: 'destructive',
      });
    }
  };

  // --- MODIFIKASI: Filter dan Sort Transaksi ---
  const filteredTransactions = transactions
    .filter(t => {
      // Filter berdasarkan tanggal mulai
      if (dateFilter.startDate && t.date < dateFilter.startDate) return false;
      // Filter berdasarkan tanggal akhir
      if (dateFilter.endDate && t.date > dateFilter.endDate) return false;
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // --- BARU: Fungsi Clear Filter ---
  const clearFilters = () => {
    setDateFilter({ startDate: '', endDate: '' });
  };
  
  return (
    <ProtectedRoute>
      {/* Tambahkan div padding untuk bottom nav */}
      <div className="pb-16 lg:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Transactions</h1>
              <p className="text-gray-600">Manage your income and expenses</p>
            </div>
            <div className="flex gap-3">
              <Dialog open={isAddTxnOpen} onOpenChange={setIsAddTxnOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="
                      bg-black text-white hover:bg-gray-800 border-2 border-black 
                      shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] 
                      transition-all w-full sm:w-auto
                    "
                    size="default" 
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Add Transaction</span>
                    <span className="sm:hidden">Add</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  {/* ... (Isi Dialog Form sama seperti sebelumnya) ... */}
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
          </div>

          {/* --- BARU: Card Filter Tanggal --- */}
          <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row items-end gap-4">
                <div className="flex items-center gap-2 w-full md:w-auto mb-2 md:mb-0">
                    <CalendarIcon className="w-5 h-5 text-gray-500" />
                    <span className="font-bold text-sm">Filter Date:</span>
                </div>
                <div className="grid grid-cols-2 gap-4 flex-1 w-full">
                  <div className="space-y-1">
                    <Label htmlFor="startDate" className="text-xs text-gray-500">From</Label>
                    <Input 
                      id="startDate"
                      type="date" 
                      value={dateFilter.startDate}
                      onChange={(e) => setDateFilter({...dateFilter, startDate: e.target.value})}
                      className="border-2 border-black h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="endDate" className="text-xs text-gray-500">To</Label>
                    <Input 
                      id="endDate"
                      type="date" 
                      value={dateFilter.endDate}
                      onChange={(e) => setDateFilter({...dateFilter, endDate: e.target.value})}
                      className="border-2 border-black h-9"
                    />
                  </div>
                </div>
                {/* Tombol Clear hanya muncul jika ada filter yang aktif */}
                {(dateFilter.startDate || dateFilter.endDate) && (
                  <Button 
                    variant="ghost" 
                    onClick={clearFilters}
                    className="h-9 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 w-full md:w-auto border-2 border-transparent hover:border-red-200"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-bold">All Transactions</CardTitle>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-md border border-gray-200">
                  {filteredTransactions.length} Record{filteredTransactions.length !== 1 && 's'}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-2">No transactions found</p>
                  {(dateFilter.startDate || dateFilter.endDate) ? (
                      <p className="text-sm text-gray-500">Try adjusting your date filters or clearing them.</p>
                  ) : (
                      <p className="text-sm text-gray-500">
                        Click &quot;Add Transaction&quot; to get started
                      </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredTransactions.map((transaction) => (
                    <Link
                      href={`/transactions/${transaction.id}`}
                      key={transaction.id}
                      className="block"
                    >
                      <div
                        className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border-2 border-black hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start gap-4 flex-1 mb-3 md:mb-0">
                          <div
                            className={`p-2 rounded-lg border-2 border-black ${
                              transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                            }`}
                          >
                            {transaction.type === 'income' ? (
                              <TrendingUp className="w-5 h-5" />
                            ) : (
                              <TrendingDown className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold">{transaction.category}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(transaction.date).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })}
                            </p>
                            {transaction.description && (
                              <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                                {transaction.description}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center w-full md:w-auto">
                          <div
                            className={`text-lg font-bold md:text-xl md:text-right flex-1 ${
                              transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {transaction.type === 'income' ? '+' : '-'}
                            {formatRupiah(transaction.amount)}
                          </div>
                          
                          <div className="flex items-center gap-2 md:gap-4 ml-4">
                            <div
                              className="border-2 border-black hover:bg-yellow-50 h-8 w-8 flex items-center justify-center"
                              title="Edit Transaction"
                            >
                              <Edit className="w-4 h-4" />
                            </div>
                            
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={(e) => handleDeleteTransaction(e, transaction.id)}
                              className="border-2 border-black hover:bg-red-50 h-8 w-8"
                              title="Delete Transaction"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}