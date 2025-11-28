'use client';

import { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SimpleProgress } from '@/components/SimpleProgress';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Target, Check, Edit, X, CheckCircle2, ArrowLeft, Save, Wallet, Calendar } from 'lucide-react';
import { formatRupiah, cleanRupiah } from '@/lib/utils';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function SavingsPage() {
  const { savingsGoals, updateSavingsGoal, deleteSavingsGoal, addSavingsGoal } = useFinance();
  const { toast } = useToast();

  const [addAmountGoalId, setAddAmountGoalId] = useState<string | null>(null);
  const [addAmountValue, setAddAmountValue] = useState('');
  const [isNewGoalOpen, setIsNewGoalOpen] = useState(false);

  // New Goal Form
  const [newGoalForm, setNewGoalForm] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    deadline: '',
  });

  // --- Handlers ---
  const handleAddAmountValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow empty string for better typing experience
    const raw = e.target.value;
    if (raw === '') {
        setAddAmountValue('');
        return;
    }
    setAddAmountValue(cleanRupiah(raw));
  };

  const handleAddAmount = async (goalId: string) => {
    const cleanedAmount = cleanRupiah(addAmountValue);
    if (!cleanedAmount || parseFloat(cleanedAmount) <= 0) return;
    
    const goal = savingsGoals.find((g) => g.id === goalId);
    if (!goal) return;
    
    const addedAmount = parseFloat(cleanedAmount);
    const newAmount = goal.currentAmount + addedAmount;
    const isCompleted = newAmount >= goal.targetAmount;
    
    try {
        await updateSavingsGoal(goalId, { currentAmount: newAmount, isCompleted });
        toast({ title: 'Success', description: isCompleted ? 'Goal completed! 🎉' : `Added ${formatRupiah(addedAmount)}` });
        setAddAmountValue('');
        setAddAmountGoalId(null);
    } catch (e) {
        toast({ title: 'Error', description: 'Failed to update.', variant: 'destructive' });
    }
  };

  const handleDeleteGoal = async (e: React.MouseEvent, goalId: string) => {
    e.stopPropagation();
    e.preventDefault();
    try {
        await deleteSavingsGoal(goalId);
        toast({ title: 'Deleted', description: 'Savings goal removed.' });
    } catch (e) {
        toast({ title: 'Error', description: 'Failed to delete.', variant: 'destructive' });
    }
  };

  const handleMarkComplete = async (e: React.MouseEvent, goalId: string) => {
    e.stopPropagation();
    e.preventDefault();
    try {
        await updateSavingsGoal(goalId, { isCompleted: true });
        toast({ title: 'Completed', description: 'Goal marked as done!' });
    } catch (e) {
        toast({ title: 'Error', description: 'Failed to update.', variant: 'destructive' });
    }
  };

  const handleCreateGoal = async () => {
      if (!newGoalForm.name || !newGoalForm.targetAmount) {
        toast({ title: 'Error', description: 'Name and Target are required', variant: 'destructive' });
        return;
      }
      try {
        await addSavingsGoal({
            name: newGoalForm.name,
            targetAmount: parseFloat(newGoalForm.targetAmount),
            currentAmount: parseFloat(newGoalForm.currentAmount || '0'),
            deadline: newGoalForm.deadline || undefined,
            isCompleted: false,
        });
        toast({ title: 'Success', description: 'New goal created' });
        setNewGoalForm({ name: '', targetAmount: '', currentAmount: '', deadline: '' });
        setIsNewGoalOpen(false);
      } catch (e) {
          toast({ title: 'Error', description: 'Failed to create goal.', variant: 'destructive' });
      }
  };

  // Helper to format the input display safely
  const getDisplayAmount = (val: string) => {
    if (!val) return '';
    const num = parseFloat(val);
    if (isNaN(num)) return '';
    return formatRupiah(num).replace('Rp', '').trim();
  };

  const activeGoals = savingsGoals.filter((g) => !g.isCompleted);
  const completedGoals = savingsGoals.filter((g) => g.isCompleted);

  return (
      <div className="min-h-screen bg-gray-50/50 pb-24 font-sans selection:bg-[#D2F65E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          
           {/* Header */}
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">Savings Goals</h1>
              <p className="text-sm text-gray-500 font-medium mt-1">Track your targets and dreams</p>
            </div>
            
            <Dialog open={isNewGoalOpen} onOpenChange={setIsNewGoalOpen}>
                <DialogTrigger asChild>
                    <Button className="h-12 rounded-full bg-black text-white font-bold hover:scale-105 transition-transform shadow-md px-6">
                        <Plus className="w-5 h-5 mr-1" /> <span className="hidden sm:inline">New Goal</span>
                    </Button>
                </DialogTrigger>
                <DialogContent className="border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-3xl sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">Create Goal</DialogTitle>
                        <DialogDescription>Set a new financial target.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label className="font-bold">Goal Name</Label>
                            <Input placeholder="e.g., New MacBook" value={newGoalForm.name} onChange={(e) => setNewGoalForm({...newGoalForm, name: e.target.value})} className="h-12 border-2 border-black rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-bold">Target Amount</Label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">Rp</span>
                                <Input placeholder="10.000.000" value={formatRupiah(parseFloat(newGoalForm.targetAmount || '0')).replace('Rp', '').trim()} onChange={(e) => setNewGoalForm({...newGoalForm, targetAmount: cleanRupiah(e.target.value)})} className="h-12 border-2 border-black rounded-xl pl-10 text-right font-bold" />
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label className="font-bold">Start With (Optional)</Label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">Rp</span>
                                <Input placeholder="0" value={formatRupiah(parseFloat(newGoalForm.currentAmount || '0')).replace('Rp', '').trim()} onChange={(e) => setNewGoalForm({...newGoalForm, currentAmount: cleanRupiah(e.target.value)})} className="h-12 border-2 border-black rounded-xl pl-10 text-right font-bold" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="font-bold">Deadline (Optional)</Label>
                            <Input type="date" value={newGoalForm.deadline} onChange={(e) => setNewGoalForm({...newGoalForm, deadline: e.target.value})} className="h-12 border-2 border-black rounded-xl" />
                        </div>
                        <Button onClick={handleCreateGoal} className="w-full h-12 rounded-full bg-black text-white font-bold border-2 border-black hover:bg-gray-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] transition-all">
                            Create Goal
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-12">
            {/* ACTIVE GOALS */}
            {activeGoals.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeGoals.map((goal) => {
                    const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
                    const progress = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
                    
                    return (
                      <Link href={`/savings/${goal.id}`} key={goal.id} className="block group h-full">
                        <Card className="border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-[2rem] hover:-translate-y-1 transition-all duration-300 h-full flex flex-col bg-white overflow-hidden">
                            <CardHeader className="px-6 pt-6 pb-2">
                                <div className="flex justify-between items-start">
                                    <div className="bg-black p-2 rounded-xl text-white">
                                        <Target className="w-6 h-6" />
                                    </div>
                                    <div className="flex gap-2">
                                         {/* Edit */}
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-yellow-100 text-gray-400 hover:text-yellow-700">
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        {/* Complete */}
                                        <Button variant="ghost" size="icon" onClick={(e) => handleMarkComplete(e, goal.id)} className="h-8 w-8 rounded-full hover:bg-green-100 text-gray-400 hover:text-green-700">
                                            <Check className="w-4 h-4" />
                                        </Button>
                                        {/* Delete */}
                                        <Button variant="ghost" size="icon" onClick={(e) => handleDeleteGoal(e, goal.id)} className="h-8 w-8 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-600">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                                <CardTitle className="text-xl font-black mt-4 line-clamp-1">{goal.name}</CardTitle>
                                {goal.deadline && <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Deadline: {new Date(goal.deadline).toLocaleDateString()}</p>}
                            </CardHeader>
                            
                            <CardContent className="p-6 pt-2 flex-1 flex flex-col justify-end">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-xs text-gray-500 font-bold">Saved</p>
                                            <p className="text-2xl font-black">{formatRupiah(goal.currentAmount)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500 font-bold">Target</p>
                                            <p className="text-lg font-black">{formatRupiah(goal.targetAmount)}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-bold mb-1">
                                            <span>{Math.round(progress)}%</span>
                                            <span className="text-[#E9572B] font-bold text-[10px]">-{formatRupiah(remaining)}</span>
                                        </div>
                                        <SimpleProgress value={progress} className="h-4 border-2 border-black rounded-full bg-gray-100" />
                                    </div>
                                </div>

                                {/* Quick Add Amount */}
                                <div 
                                    className="mt-6 pt-4 border-t border-dashed border-gray-200" 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
                                >
                                    {addAmountGoalId === goal.id ? (
                                        <div className="flex gap-2 animate-in fade-in zoom-in-95 duration-200">
                                            <div className="relative flex-1">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-xs">Rp</span>
                                                <Input 
                                                    autoFocus
                                                    placeholder="0" 
                                                    className="h-10 pl-8 pr-2 border-2 border-black rounded-xl text-sm font-bold"
                                                    value={getDisplayAmount(addAmountValue)}
                                                    onChange={handleAddAmountValueChange}
                                                    onClick={(e) => e.stopPropagation()}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') handleAddAmount(goal.id);
                                                    }}
                                                />
                                            </div>
                                            <Button size="sm" onClick={() => handleAddAmount(goal.id)} className="rounded-xl bg-[#D2F65E] text-black border-2 border-black hover:bg-[#c3e655] font-bold">
                                                <Check className="w-4 h-4" />
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                variant="outline" 
                                                onClick={() => { 
                                                    setAddAmountGoalId(null); 
                                                    setAddAmountValue(''); 
                                                }} 
                                                className="rounded-xl border-2 border-gray-200 hover:border-black text-gray-400 hover:text-black"
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button 
                                            onClick={(e) => { 
                                                e.preventDefault(); 
                                                e.stopPropagation(); 
                                                setAddAmountGoalId(goal.id); 
                                            }} 
                                            variant="outline" 
                                            className="w-full rounded-xl border-2 border-black hover:bg-black hover:text-white font-bold transition-colors"
                                        >
                                            <Plus className="w-4 h-4 mr-2" /> Add Money
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
              </div>
            )}

            {/* COMPLETED GOALS */}
            {completedGoals.length > 0 && (
                <div>
                    <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
                        <CheckCircle2 className="w-6 h-6 text-green-600" /> Completed
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {completedGoals.map((goal) => (
                            <div key={goal.id} className="bg-green-50 border-2 border-green-200 rounded-[2rem] p-6 relative overflow-hidden">
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-xl font-black text-green-900 line-clamp-1">{goal.name}</h3>
                                        <div className="bg-green-200 p-1.5 rounded-full text-green-800">
                                            <Check className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <p className="text-3xl font-black text-green-800 mb-1">{formatRupiah(goal.targetAmount)}</p>
                                    <p className="text-xs font-bold text-green-600 uppercase tracking-wider">Goal Achieved</p>
                                    
                                    <div className="mt-6 flex justify-end">
                                        <Button 
                                            size="sm" 
                                            variant="ghost" 
                                            onClick={(e) => handleDeleteGoal(e, goal.id)} 
                                            className="text-green-700 hover:bg-green-200 hover:text-green-900 rounded-full px-4"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" /> Remove
                                        </Button>
                                    </div>
                                </div>
                                {/* Decoration */}
                                <div className="absolute -right-6 -bottom-6 opacity-10">
                                    <Target className="w-32 h-32 text-green-800" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* EMPTY STATE */}
            {savingsGoals.length === 0 && (
                <div className="bg-white border-2 border-dashed border-gray-300 rounded-[2.5rem] p-16 text-center flex flex-col items-center justify-center min-h-[400px]">
                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-sm">
                        <Target className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-2xl font-black mb-2">No Goals Yet</h3>
                    <p className="text-gray-500 mb-8 max-w-xs mx-auto">Start saving for your dreams today. Create your first goal!</p>
                    <Button onClick={() => setIsNewGoalOpen(true)} className="h-14 px-10 rounded-full bg-black text-white font-bold text-lg hover:scale-105 transition-transform shadow-lg">
                        Create Goal
                    </Button>
                </div>
            )}
          </div>
        </div>
      </div>
  );
}