'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useFinance, Transaction } from '@/contexts/FinanceContext';
import { Button } from '@/components/ui/button';
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
import { formatRupiah, cleanRupiah } from '@/lib/utils';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';


// Kategori
const incomeCategories = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'];
const expenseCategories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Other'];

export default function TransactionDetailPage() {
  const { getTransactionById, updateTransaction, deleteTransaction } = useFinance();
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [transactionForm, setTransactionForm] = useState<Omit<Transaction, 'id' | 'userId' | 'createdAt'>>({
    type: 'expense',
    amount: 0,
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const tx = getTransactionById(id);
      if (tx) {
        setTransactionForm({
          type: tx.type,
          amount: tx.amount,
          category: tx.category,
          description: tx.description || '',
          date: tx.date.split('T')[0],
        });
        setIsLoading(false);
      } else {
        // Coba lagi setelah 1 detik jika data belum ada (mungkin context belum terisi)
        setTimeout(() => {
          const retryTx = getTransactionById(id);
          if (retryTx) {
            setTransactionForm({
              type: retryTx.type,
              amount: retryTx.amount,
              category: retryTx.category,
              description: retryTx.description || '',
              date: retryTx.date.split('T')[0],
            });
            setIsLoading(false);
          } else {
            toast({ title: 'Error', description: 'Transaction not found', variant: 'destructive' });
            router.push('/transactions');
          }
        }, 1000);
      }
    }
  }, [id, getTransactionById, router, toast]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanedValue = cleanRupiah(e.target.value);
    setTransactionForm({ ...transactionForm, amount: parseFloat(cleanedValue || '0') });
  };

  const handleSaveTransaction = async () => {
    if (!transactionForm.amount || !transactionForm.category) {
      toast({ title: 'Error', description: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    
    try {
      await updateTransaction(id, transactionForm);
      toast({ title: 'Success', description: 'Transaction updated successfully' });
      router.push('/transactions'); // Kembali ke list
    } catch(e) {
      toast({ title: 'Error', description: 'Failed to update transaction.', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTransaction(id);
      toast({ title: 'Success', description: 'Transaction deleted' });
      router.push('/transactions');
    } catch(e) {
      toast({ title: 'Error', description: 'Failed to delete transaction.', variant: 'destructive' });
    }
  };
  
  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-lg font-semibold">Loading Transaction...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header dengan Tombol Back */}
        <div className="mb-6">
          <Link href="/transactions" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-black transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Transactions
          </Link>
        </div>

        <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Edit Transaction</CardTitle>
            <CardDescription>
                Modify the details of this transaction.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Form Edit */}
            <Tabs
              value={transactionForm.type}
              onValueChange={(value) =>
                setTransactionForm({ ...transactionForm, type: value as 'income' | 'expense' })
              }
            >
              <TabsList className="grid w-full grid-cols-2 border-2 border-black">
                {/* Nonaktifkan pergantian tipe saat edit */}
                <TabsTrigger value="expense" className="font-semibold" disabled>
                  Expense
                </TabsTrigger>
                <TabsTrigger value="income" className="font-semibold" disabled>
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
                        value={formatRupiah(transactionForm.amount).replace('Rp', '').trim()}
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
            
            {/* Tombol Aksi */}
            <div className="flex gap-3 pt-6 mt-6 border-t border-dashed">
              <Button
                onClick={handleSaveTransaction}
                className="flex-1 bg-black text-white hover:bg-gray-800 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                Save Changes
              </Button>
              
              {/* Tombol Delete dengan Konfirmasi */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete this transaction.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}