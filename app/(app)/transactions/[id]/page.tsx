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
import { ArrowLeft, Trash2, Save, Calendar, Tag, FileText } from 'lucide-react';
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
      router.push('/transactions');
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-black border-t-[#D2F65E] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50/50 pb-24 font-sans selection:bg-[#D2F65E]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          <div className="mb-8">
            <Link href="/transactions" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Transactions
            </Link>
            <h1 className="text-3xl md:text-4xl font-black mt-4 tracking-tight">Edit Transaction</h1>
          </div>

          <Card className="border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="px-8 pt-8 pb-2">
              <CardTitle className="text-xl font-black">Details</CardTitle>
              <CardDescription className="font-medium">Modify transaction information.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-4">
              
              <Tabs value={transactionForm.type} onValueChange={(value) => setTransactionForm({ ...transactionForm, type: value as 'income' | 'expense' })}>
                <TabsList className="grid w-full grid-cols-2 border-2 border-black rounded-xl p-1 h-auto bg-white mb-6">
                  <TabsTrigger value="expense" disabled className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white font-bold py-2 disabled:opacity-50">Expense</TabsTrigger>
                  <TabsTrigger value="income" disabled className="rounded-lg data-[state=active]:bg-[#D2F65E] data-[state=active]:text-black font-bold py-2 disabled:opacity-50">Income</TabsTrigger>
                </TabsList>
                
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label className="font-bold text-gray-700">Amount</Label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-lg">Rp</span>
                        <Input
                          type="text" 
                          value={formatRupiah(transactionForm.amount).replace('Rp', '').trim()}
                          onChange={handleAmountChange}
                          className="h-14 border-2 border-black rounded-2xl pl-12 text-right text-xl font-black bg-gray-50 focus:bg-white transition-all" 
                        />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <Label className="font-bold text-gray-700 flex items-center gap-2"><Tag className="w-4 h-4" /> Category</Label>
                        <Select value={transactionForm.category} onValueChange={(v) => setTransactionForm({ ...transactionForm, category: v })}>
                            <SelectTrigger className="h-12 border-2 border-black rounded-xl font-bold">
                            <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent className="border-2 border-black rounded-xl font-medium">
                            {(transactionForm.type === 'expense' ? expenseCategories : incomeCategories).map((cat) => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label className="font-bold text-gray-700 flex items-center gap-2"><Calendar className="w-4 h-4" /> Date</Label>
                        <Input type="date" value={transactionForm.date} onChange={(e) => setTransactionForm({...transactionForm, date: e.target.value})} className="h-12 border-2 border-black rounded-xl font-bold" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold text-gray-700 flex items-center gap-2"><FileText className="w-4 h-4" /> Description</Label>
                    <Textarea 
                        placeholder="Add notes..." 
                        value={transactionForm.description} 
                        onChange={(e) => setTransactionForm({...transactionForm, description: e.target.value})} 
                        className="border-2 border-black rounded-xl min-h-[100px] font-medium resize-none p-4" 
                    />
                  </div>
                </div>
              </Tabs>
              
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-8 mt-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto h-12 rounded-full border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-500 hover:text-red-700 font-bold transition-colors">
                      <Trash2 className="w-5 h-5 mr-2" /> Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-3xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-xl font-black">Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription className="font-medium text-gray-600">
                        This action cannot be undone. This transaction will be permanently deleted.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-full font-bold border-2 border-gray-200">Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="rounded-full font-bold bg-red-600 text-white hover:bg-red-700 border-2 border-red-700">
                        Delete Transaction
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Button onClick={handleSaveTransaction} className="flex-1 h-12 rounded-full bg-black text-white font-bold text-lg hover:scale-[1.02] transition-transform shadow-md">
                  <Save className="w-5 h-5 mr-2" /> Save Changes
                </Button>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}