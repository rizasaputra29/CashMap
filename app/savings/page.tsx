// rizasaputra29/financial-tracker/Financial-Tracker-15996308ee6cfd5d3abc50bd8eb71447eefc8019/app/savings/page.tsx
'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navigation } from '@/components/Navigation';
import { useFinance } from '@/contexts/FinanceContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SimpleProgress } from '@/components/SimpleProgress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Target, Check, DollarSign } from 'lucide-react';
import { formatRupiah, cleanRupiah } from '@/lib/utils';

export default function SavingsPage() {
  const { savingsGoals, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal } = useFinance();
  const { toast } = useToast();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addAmountGoalId, setAddAmountGoalId] = useState<string | null>(null);
  const [addAmountValue, setAddAmountValue] = useState(''); // String murni

  const [goalForm, setGoalForm] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    deadline: '',
  });

  const handleGoalAmountChange = (key: 'targetAmount' | 'currentAmount', e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanedValue = cleanRupiah(e.target.value);
    setGoalForm({ ...goalForm, [key]: cleanedValue });
  };

  const handleAddAmountValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanedValue = cleanRupiah(e.target.value);
    setAddAmountValue(cleanedValue);
  };

  const handleAddGoal = async () => {
    if (!goalForm.name || !goalForm.targetAmount) {
      toast({
        title: 'Error',
        description: 'Please fill all required fields',
        variant: 'destructive',
      });
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

        toast({
            title: 'Success',
            description: 'Savings goal created successfully',
        });

        setGoalForm({
            name: '',
            targetAmount: '',
            currentAmount: '',
            deadline: '',
        });
        setIsAddOpen(false);
    } catch (e) {
        toast({
            title: 'Error',
            description: 'Failed to create savings goal. Please check server connection.',
            variant: 'destructive',
        });
    }
  };

  const handleAddAmount = async (goalId: string) => {
    // FIX: Validasi harus menggunakan nilai bersih
    const cleanedAmount = cleanRupiah(addAmountValue);
    if (!cleanedAmount || parseFloat(cleanedAmount) <= 0) return;

    const goal = savingsGoals.find((g) => g.id === goalId);
    if (!goal) return;

    const addedAmount = parseFloat(cleanedAmount);
    const newAmount = goal.currentAmount + addedAmount;
    const isCompleted = newAmount >= goal.targetAmount;

    try {
        // Panggil updateSavingsGoal dengan nilai numerik yang terhitung
        await updateSavingsGoal(goalId, {
            currentAmount: newAmount,
            isCompleted,
        });

        toast({
            title: 'Success',
            description: isCompleted
                ? 'Congratulations! Goal completed!'
                : 'Amount added to savings goal',
        });

        setAddAmountValue('');
        setAddAmountGoalId(null);
    } catch (e) {
        toast({
            title: 'Error',
            description: 'Failed to add amount. Please check server connection.',
            variant: 'destructive',
        });
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
        await deleteSavingsGoal(goalId);
        toast({
            title: 'Success',
            description: 'Savings goal deleted',
        });
    } catch (e) {
        toast({
            title: 'Error',
            description: 'Failed to delete goal. Please check server connection.',
            variant: 'destructive',
        });
    }
  };

  const handleMarkComplete = async (goalId: string) => {
    try {
        await updateSavingsGoal(goalId, { isCompleted: true });
        toast({
            title: 'Success',
            description: 'Goal marked as completed',
        });
    } catch (e) {
        toast({
            title: 'Error',
            description: 'Failed to mark goal complete. Please check server connection.',
            variant: 'destructive',
        });
    }
  };

  const activeGoals = savingsGoals.filter((g) => !g.isCompleted);
  const completedGoals = savingsGoals.filter((g) => g.isCompleted);

  const getFormattedGoalValue = (key: 'targetAmount' | 'currentAmount') => {
    return formatRupiah(parseFloat(goalForm[key] || '0')).replace('Rp', '').trim();
  };
  const getFormattedAddAmountValue = () => {
    return formatRupiah(parseFloat(addAmountValue || '0')).replace('Rp', '').trim();
  };


  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header and Add Goal Dialog remain the same */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">Savings Goals</h1>
              <p className="text-gray-600">Track your savings targets and progress</p>
            </div>
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button
                  className="
                    bg-black text-white hover:bg-gray-800 border-2 border-black
                    shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                    transition-all
                    w-10 px-0
                    sm:w-auto sm:px-4
                  "
                  size="default"
                >
                  <Plus className="w-4 h-4 mr-0 sm:mr-2" />
                  <span className="hidden sm:inline">Add Goal</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                {/* ... Dialog Content remains the same ... */}
                 <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">Create Savings Goal</DialogTitle>
                  <DialogDescription>
                      Define your target amount and optional deadline for your goal.
                  </DialogDescription>
                </DialogHeader>
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
                    onClick={handleAddGoal}
                    className="w-full bg-black text-white hover:bg-gray-800 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                  >
                    Create Goal
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-6">
            {activeGoals.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Active Goals</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeGoals.map((goal) => {
                    const remainingToSave = Math.max(0, goal.targetAmount - goal.currentAmount);

                    return (
                      <Card
                        key={goal.id}
                        className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                      >
                        {/* CardHeader remains the same */}
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-xl font-bold">{goal.name}</CardTitle>
                              {goal.deadline && (
                                <p className="text-sm text-gray-600 mt-1">
                                  Deadline:{' '}
                                  {new Date(goal.deadline).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                  })}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleMarkComplete(goal.id)}
                                className="border-2 border-black hover:bg-green-50"
                                title="Mark as complete"
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleDeleteGoal(goal.id)}
                                className="border-2 border-black hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Progress bar remains the same */}
                          <div>
                            <div className="flex justify-between mb-2">
                              <span className="text-sm font-semibold">Progress</span>
                              <span className="text-sm font-semibold">
                                {Math.round((goal.currentAmount / goal.targetAmount) * 100)}%
                              </span>
                            </div>
                            <SimpleProgress
                              value={(goal.currentAmount / goal.targetAmount) * 100}
                              className="h-3 border-2 border-black"
                            />
                          </div>

                          {/* *** MODIFIED: Layout for amounts *** */}
                          <div className="text-sm">
                            <div className="flex justify-between mb-2"> {/* Current & Target */}
                              <div>
                                <p className="text-gray-600">Current</p>
                                <p className="font-bold text-lg">
                                  {formatRupiah(goal.currentAmount)}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-gray-600">Target</p>
                                <p className="font-bold text-lg">
                                  {formatRupiah(goal.targetAmount)}
                                </p>
                              </div>
                            </div>
                            {/* *** NEW: Remaining amount centered below *** */}
                            <div className="text-center mt-2 pt-2 border-t border-dashed">
                              <p className="text-sm text-gray-600">Remaining to Save</p>
                              <p className="font-bold text-lg text-orange-600">
                                {formatRupiah(remainingToSave)}
                              </p>
                            </div>
                            {/* *** END: Amount layout modification *** */}
                          </div>


                          {/* Add Money section remains the same */}
                          <div className="pt-4 border-t-2 border-black">
                            {addAmountGoalId === goal.id ? (
                              <div className="flex gap-2">
                                <div className="relative flex-1">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rp</span>
                                  <Input
                                    type="text"
                                    placeholder="Amount to add"
                                    value={getFormattedAddAmountValue()}
                                    onChange={handleAddAmountValueChange}
                                    className="border-2 border-black pl-8 text-right"
                                  />
                                </div>
                                <Button
                                  onClick={() => handleAddAmount(goal.id)}
                                  className="bg-black text-white hover:bg-gray-800 border-2 border-black"
                                >
                                  Add
                                </Button>
                                <Button
                                  onClick={() => {
                                    setAddAmountGoalId(null);
                                    setAddAmountValue('');
                                  }}
                                  variant="outline"
                                  className="border-2 border-black"
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <Button
                                onClick={() => setAddAmountGoalId(goal.id)}
                                className="w-full bg-white text-black hover:bg-gray-100 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
                              >
                                <DollarSign className="w-4 h-4 mr-2" />
                                Add Money
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Completed Goals section remains the same */}
            {completedGoals.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Completed Goals</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {completedGoals.map((goal) => (
                    <Card
                      key={goal.id}
                      className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-green-50"
                    >
                      {/* ... Completed Goal Card Content ... */}
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-xl font-bold">{goal.name}</CardTitle>
                              <div className="p-1 bg-green-600 rounded-full">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            </div>
                            {goal.deadline && (
                              <p className="text-sm text-gray-600 mt-1">
                                Completed on:{' '}
                                {new Date(goal.deadline).toLocaleDateString('id-ID')}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeleteGoal(goal.id)}
                            className="border-2 border-black hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-4">
                          <p className="text-gray-600 mb-2">Goal Achieved</p>
                          <p className="font-bold text-2xl">
                            {formatRupiah(goal.targetAmount)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* No Goals Yet card remains the same */}
            {savingsGoals.length === 0 && (
              <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Target className="w-16 h-16 mb-4 text-gray-400" />
                  <h3 className="text-2xl font-bold mb-2">No Savings Goals Yet</h3>
                  <p className="text-gray-600 mb-6 text-center">
                    Create your first savings goal to start tracking your progress
                  </p>
                  {/* Optionally add the Add Goal button here too */}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}