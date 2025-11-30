import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';

// GET: Read all transactions
export async function GET(request: Request) {
  const userId = getUserIdFromRequest(request); 

  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Transactions GET Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Create transaction
export async function POST(request: Request) {
  const userId = getUserIdFromRequest(request); 

  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Note: savingsGoalId is ignored here as per your schema requirements
    const { type, amount, category, description, date } = await request.json();

    const newTransaction = await prisma.transaction.create({
      data: {
        userId,
        type,
        amount: parseFloat(amount),
        category,
        description,
        date: new Date(date), 
      },
    });
    return NextResponse.json(newTransaction, { status: 201 });
  } catch (error) {
    console.error('Transactions POST Error:', error);
    return NextResponse.json({ message: 'Failed to create transaction' }, { status: 500 });
  }
}

// PUT: Update transaction
export async function PUT(request: Request) {
    const userId = getUserIdFromRequest(request);
  
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
  
    try {
        const { id, type, amount, category, description, date } = await request.json();

        if (!id) {
            return NextResponse.json({ message: 'Transaction ID required' }, { status: 400 });
        }
  
        const updatedTransaction = await prisma.transaction.update({
            where: { id, userId }, 
            data: {
                type,
                amount: parseFloat(amount),
                category,
                description,
                date: new Date(date), 
            },
        });
        return NextResponse.json(updatedTransaction);
    } catch (error) {
      console.error('Transactions PUT Error:', error);
      return NextResponse.json({ message: 'Failed to update transaction' }, { status: 500 });
    }
}

// DELETE: Delete transaction
export async function DELETE(request: Request) {
    const userId = getUserIdFromRequest(request); 
  
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
  
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ message: 'Transaction ID required' }, { status: 400 });
        }

        // 1. Fetch transaction first to see if it's a Savings transaction
        const transaction = await prisma.transaction.findUnique({
            where: { id, userId },
        });

        if (!transaction) {
             return NextResponse.json({ message: 'Transaction not found' }, { status: 404 });
        }

        // 2. Perform delete and update goal (Workaround using Description matching)
        await prisma.$transaction(async (tx) => {
            // Check if this transaction looks like a savings contribution
            if (transaction.category === 'Savings' && transaction.description) {
                // Logic: Extract Goal Name from description format "Saved for [GoalName]"
                // This matches the format used in app/(app)/savings/page.tsx
                let goalName = null;
                const savedForMatch = transaction.description.match(/^Saved for (.+)$/);
                const initialMatch = transaction.description.match(/^Initial deposit for (.+)$/);

                if (savedForMatch) {
                    goalName = savedForMatch[1];
                } else if (initialMatch) {
                    goalName = initialMatch[1];
                }

                if (goalName) {
                    // Try to find the goal by name
                    const goal = await tx.savingsGoal.findFirst({
                        where: { userId, name: goalName }
                    });

                    if (goal) {
                        const newAmount = Math.max(0, goal.currentAmount - transaction.amount);
                        const isCompleted = newAmount >= goal.targetAmount;

                        await tx.savingsGoal.update({
                            where: { id: goal.id },
                            data: { 
                                currentAmount: newAmount,
                                isCompleted: isCompleted
                            }
                        });
                    }
                }
            }

            // Finally delete the transaction
            await tx.transaction.delete({
                where: { id, userId }, 
            });
        });

        return NextResponse.json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        console.error('Transactions DELETE Error:', error);
        return NextResponse.json({ message: 'Failed to delete transaction' }, { status: 500 });
    }
}