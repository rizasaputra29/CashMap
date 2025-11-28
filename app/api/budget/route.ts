import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';

// GET: Read Budget Limit
export async function GET(request: Request) {
  const userId = getUserIdFromRequest(request); 

  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const budget = await prisma.budgetLimit.findUnique({
      where: { userId },
    });

    if (budget) {
        const budgetData = {
            ...budget,
            startDate: budget.startDate.toISOString().split('T')[0],
            endDate: budget.endDate.toISOString().split('T')[0],
        };
        return NextResponse.json(budgetData);
    }
    
    return NextResponse.json(null);
  } catch (error) {
    console.error('Budget GET Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Set/Update Budget
export async function POST(request: Request) {
  const userId = getUserIdFromRequest(request); 

  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { totalBudget, dailyLimit, startDate, endDate, isActive } = await request.json();

    const newBudget = await prisma.budgetLimit.upsert({
      where: { userId },
      update: {
        totalBudget: parseFloat(totalBudget),
        dailyLimit: parseFloat(dailyLimit),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: isActive,
      },
      create: {
        userId,
        totalBudget: parseFloat(totalBudget),
        dailyLimit: parseFloat(dailyLimit),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: isActive,
      },
    });

    const budgetData = {
        ...newBudget,
        startDate: newBudget.startDate.toISOString().split('T')[0],
        endDate: newBudget.endDate.toISOString().split('T')[0],
    };
    
    return NextResponse.json(budgetData, { status: 201 });
  } catch (error) {
    console.error('Budget POST Error:', error);
    return NextResponse.json({ message: 'Failed to save budget' }, { status: 500 });
  }
}