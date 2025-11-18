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
import { ArrowLeft, Save } from 'lucide-react';
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
      router.push('/savings'); // Kembali ke list

    } catch (e) {
        toast({ title: 'Error', description: 'Failed to create goal.', variant: 'destructive' });
    }
  };

  const getFormattedGoalValue = (key: 'targetAmount' | 'currentAmount') => {
    return formatRupiah(parseFloat(goalForm[key] || '0')).replace('Rp', '').trim();
  };

  return (
    <ProtectedRoute>
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header dengan Tombol Back */}
        <div className="mb-6">
          <Link href="/savings" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-black transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Savings Goals
          </Link>
        </div>

        <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Create New Goal</CardTitle>
            <CardDescription>
              Define your target amount and optional deadline.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Goal Name</Label>
                <Input
                  placeholder="e.g., Emergency Fund, Vacation"
                  value={goalForm.name}
                  onChange={(e) => setGoalForm({ ...goalForm, name: e.target.value })}
                  className="border-2 border-black"
                />
              </div>
              <div className="space-y-2">
                <Label>Target Amount</Label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rp</span>
                    <Input
                      type="text"
                      placeholder="10.000.000"
                      value={getFormattedGoalValue('targetAmount')}
                      onChange={(e) => handleGoalAmountChange('targetAmount', e)}
                      className="border-2 border-black pl-8 text-right"
                    />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Starting Amount (Optional)</Label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rp</span>
                    <Input
                      type="text"
                      placeholder="0"
                      value={getFormattedGoalValue('currentAmount')}
                      onChange={(e) => handleGoalAmountChange('currentAmount', e)}
                      className="border-2 border-black pl-8 text-right"
                    />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Deadline (Optional)</Label>
                <Input
                  type="date"
                  value={goalForm.deadline}
                  onChange={(e) => setGoalForm({ ...goalForm, deadline: e.target.value })}
                  className="border-2 border-black"
                />
              </div>
              
              <Button
                onClick={handleSaveGoal}
                className="w-full bg-black text-white hover:bg-gray-800 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                <Save className="w-4 h-4 mr-2" />
                Create Goal
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}