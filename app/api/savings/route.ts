import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';

// GET: Read Savings Goals
export async function GET(request: Request) {
  const userId = getUserIdFromRequest(request); 

  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const goals = await prisma.savingsGoal.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
    
    const goalsData = goals.map(g => ({
        ...g,
        deadline: g.deadline ? g.deadline.toISOString().split('T')[0] : undefined,
    }));
    
    return NextResponse.json(goalsData);
  } catch (error) {
    console.error('Savings GET Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Add Savings Goal
export async function POST(request: Request) {
  const userId = getUserIdFromRequest(request); 

  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, targetAmount, currentAmount, deadline, isCompleted } = await request.json();

    const newGoal = await prisma.savingsGoal.create({
      data: {
        userId,
        name,
        targetAmount: parseFloat(targetAmount),
        currentAmount: parseFloat(currentAmount),
        deadline: deadline ? new Date(deadline) : null,
        isCompleted: isCompleted ?? false,
      },
    });
    
    const goalData = {
        ...newGoal,
        deadline: newGoal.deadline ? newGoal.deadline.toISOString().split('T')[0] : undefined,
    };
    
    return NextResponse.json(goalData, { status: 201 });
  } catch (error) {
    console.error('Savings POST Error:', error);
    return NextResponse.json({ message: 'Failed to create goal' }, { status: 500 });
  }
}

// PUT: Update Savings Goal
export async function PUT(request: Request) {
    const userId = getUserIdFromRequest(request); 

    if (!userId) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id, updates } = await request.json(); 
        
        const dataToUpdate: Record<string, any> = {};
        for (const key in updates) {
            if (updates[key] !== undefined) {
                let value = updates[key];
                if (key === 'currentAmount' || key === 'targetAmount') {
                    value = parseFloat(updates[key]);
                }
                if (key === 'deadline' && updates[key]) {
                    value = new Date(updates[key]);
                }
                dataToUpdate[key] = value;
            }
        }
        
        const updatedGoal = await prisma.savingsGoal.update({
            where: { id, userId },
            data: dataToUpdate,
        });

        const goalData = {
            ...updatedGoal,
            deadline: updatedGoal.deadline ? updatedGoal.deadline.toISOString().split('T')[0] : undefined,
        };

        return NextResponse.json(goalData);
    } catch (error) {
        console.error('Savings PUT Error:', error);
        return NextResponse.json({ message: 'Failed to update goal' }, { status: 500 });
    }
}

// DELETE: Delete Savings Goal
export async function DELETE(request: Request) {
    const userId = getUserIdFromRequest(request); 

    if (!userId) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ message: 'Goal ID required' }, { status: 400 });
        }

        await prisma.savingsGoal.delete({
            where: { id, userId }, 
        });

        return NextResponse.json({ message: 'Goal deleted successfully' });
    } catch (error) {
        console.error('Savings DELETE Error:', error);
        return NextResponse.json({ message: 'Failed to delete goal' }, { status: 500 });
    }
}