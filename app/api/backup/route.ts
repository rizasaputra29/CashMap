import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';
import type { Transaction, BudgetLimit, SavingsGoal } from '@prisma/client'; 

export const dynamic = 'force-dynamic'; 

// GET: Export Data
export async function GET(request: Request) {
  const userId = getUserIdFromRequest(request); 

  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Menggunakan prisma.$transaction untuk efisiensi
    const [transactions, budgetLimit, savingsGoals] = await prisma.$transaction([
      prisma.transaction.findMany({ where: { userId } }),
      prisma.budgetLimit.findUnique({ where: { userId } }),
      prisma.savingsGoal.findMany({ where: { userId } }),
    ]) as [Transaction[], BudgetLimit | null, SavingsGoal[]]; 

    const backupData = {
      version: 1.0, 
      timestamp: new Date().toISOString(),
      user_id: userId,
      transactions: transactions.map((t) => ({
        ...t,
        date: t.date.toISOString(),
        createdAt: t.createdAt.toISOString(),
      })),
      budgetLimit: budgetLimit ? {
          ...budgetLimit,
          startDate: budgetLimit.startDate.toISOString(),
          endDate: budgetLimit.endDate.toISOString(),
          createdAt: budgetLimit.createdAt.toISOString(),
          updatedAt: budgetLimit.updatedAt.toISOString(),
      } : null,
      savingsGoals: savingsGoals.map((g) => ({
        ...g,
        deadline: g.deadline ? g.deadline.toISOString() : null,
        createdAt: g.createdAt.toISOString(),
        updatedAt: g.updatedAt.toISOString(),
      })),
    };

    return new NextResponse(JSON.stringify(backupData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="financial_tracker_backup_${userId}.json"`,
      },
    });

  } catch (error) {
    console.error('Backup Error:', error);
    return NextResponse.json({ message: 'Failed to create backup' }, { status: 500 });
  }
}