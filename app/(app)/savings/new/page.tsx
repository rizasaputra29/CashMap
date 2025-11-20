'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useFinance } from '@/contexts/FinanceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { formatRupiah, cleanRupiah } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Target, Calendar, Wallet } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const initialGoalForm = {
  name: '',
  targetAmount: '',
  currentAmount: '',
  deadline: '',
};

export default function NewSavingsGoalPage() {
  const { addSavingsGoal } = useFinance();
  const { toast } = useToast();
  const router = useRouter();

  const [goalForm, setGoalForm] = useState(initialGoalForm);

  const handleGoalAmountChange = (key: 'targetAmount' | 'currentAmount', e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanedValue = cleanRupiah(e.target.value);
    setGoalForm({ ...goalForm, [key]: cleanedValue });
  };

  const handleSaveGoal = async () => {
    if (!goalForm.name || !goalForm.targetAmount) {
      toast({ title: 'Error', description: 'Please fill Goal Name and Target Amount', variant: 'destructive' });
      return;
    }

    try {
      await addSavingsGoal({
          name: goalForm.name,
          targetAmount: parseFloat(goalForm.targetAmount),
          currentAmount: parseFloat(goalForm.currentAmount || '0'),
          deadline: goalForm.deadline || undefined,
          isCompleted: false,
      });
      toast({ title: 'Success', description: 'Savings goal created' });
      router.push('/savings');

    } catch (e) {
        toast({ title: 'Error', description: 'Failed to create goal.', variant: 'destructive' });
    }
  };

  const getFormattedGoalValue = (key: 'targetAmount' | 'currentAmount') => {
    return formatRupiah(parseFloat(goalForm[key] || '0')).replace('Rp', '').trim();
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50/50 pb-24 font-sans selection:bg-[#D2F65E]">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          <div className="mb-8">
            <Link href="/savings" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Savings
            </Link>
            <h1 className="text-3xl md:text-4xl font-black mt-4 tracking-tight">New Goal</h1>
          </div>

          <Card className="border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="px-8 pt-8 pb-2 bg-[#D2F65E]/10 border-b-2 border-gray-100">
              <div className="w-12 h-12 bg-[#D2F65E] rounded-xl border-2 border-black flex items-center justify-center mb-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <Target className="w-6 h-6 text-black" />
              </div>
              <CardTitle className="text-2xl font-black">Set a Target</CardTitle>
              <CardDescription className="font-medium text-gray-600">What are you saving for?</CardDescription>
            </CardHeader>
            
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="font-bold text-gray-700 text-sm uppercase tracking-wider">Goal Name</Label>
                  <Input
                    placeholder="e.g., New MacBook, Dream Vacation"
                    value={goalForm.name}
                    onChange={(e) => setGoalForm({ ...goalForm, name: e.target.value })}
                    className="h-14 border-2 border-black rounded-2xl text-lg font-bold px-4 focus:ring-4 focus:ring-[#D2F65E]/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="font-bold text-gray-700 text-sm uppercase tracking-wider">Target Amount</Label>
                  <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-black text-xl">Rp</span>
                      <Input
                        type="text"
                        placeholder="10.000.000"
                        value={getFormattedGoalValue('targetAmount')}
                        onChange={(e) => handleGoalAmountChange('targetAmount', e)}
                        className="h-16 border-2 border-black rounded-2xl pl-12 text-right text-2xl font-black bg-gray-50 focus:bg-white transition-all"
                      />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="font-bold text-gray-700 flex items-center gap-2"><Wallet className="w-4 h-4" /> Start Balance</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">Rp</span>
                            <Input
                            type="text"
                            placeholder="0"
                            value={getFormattedGoalValue('currentAmount')}
                            onChange={(e) => handleGoalAmountChange('currentAmount', e)}
                            className="h-12 border-2 border-black rounded-xl pl-10 text-right font-bold"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="font-bold text-gray-700 flex items-center gap-2"><Calendar className="w-4 h-4" /> Deadline</Label>
                        <Input
                        type="date"
                        value={goalForm.deadline}
                        onChange={(e) => setGoalForm({ ...goalForm, deadline: e.target.value })}
                        className="h-12 border-2 border-black rounded-xl font-bold"
                        />
                    </div>
                </div>
                
                <Button
                  onClick={handleSaveGoal}
                  className="w-full h-14 mt-4 rounded-full bg-black text-white text-lg font-bold hover:scale-[1.02] transition-transform shadow-md hover:bg-gray-900"
                >
                  <Save className="w-5 h-5 mr-2" /> Create Goal
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}