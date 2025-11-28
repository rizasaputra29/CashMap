import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic'; 

// POST: Import Data
export async function POST(request: Request) {
  const userId = getUserIdFromRequest(request); 

  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const backupData: any = await request.json();

    if (!backupData || backupData.user_id !== userId) {
      return NextResponse.json({ message: 'Invalid or mismatched backup file' }, { status: 400 });
    }

    // Hapus Data Lama & Masukkan Baru dalam Satu Transaksi
    await prisma.$transaction(async (tx) => {
        // 1. Cleanup
        await tx.transaction.deleteMany({ where: { userId } });
        await tx.budgetLimit.deleteMany({ where: { userId } });
        await tx.savingsGoal.deleteMany({ where: { userId } });

        // 2. Restore Transactions
        if (backupData.transactions?.length) {
            await tx.transaction.createMany({
                data: backupData.transactions.map((t: any) => ({
                    ...t,
                    userId,
                    amount: parseFloat(t.amount),
                    date: new Date(t.date),
                    createdAt: new Date(t.createdAt),
                }))
            });
        }

        // 3. Restore Budget
        if (backupData.budgetLimit) {
            const b = backupData.budgetLimit;
            await tx.budgetLimit.create({
                data: {
                    userId,
                    totalBudget: parseFloat(b.totalBudget),
                    dailyLimit: parseFloat(b.dailyLimit),
                    startDate: new Date(b.startDate),
                    endDate: new Date(b.endDate),
                    isActive: b.isActive,
                }
            });
        }

        // 4. Restore Savings
        if (backupData.savingsGoals?.length) {
            await tx.savingsGoal.createMany({
                data: backupData.savingsGoals.map((g: any) => ({
                    ...g,
                    userId,
                    targetAmount: parseFloat(g.targetAmount),
                    currentAmount: parseFloat(g.currentAmount),
                    deadline: g.deadline ? new Date(g.deadline) : null,
                    createdAt: new Date(g.createdAt),
                    updatedAt: new Date(g.updatedAt),
                }))
            });
        }
    });

    return NextResponse.json({ message: 'Data imported successfully' }, { status: 200 });

  } catch (error) {
    console.error('Import Error:', error);
    return NextResponse.json({ message: 'Failed to import data' }, { status: 500 });
  }
}