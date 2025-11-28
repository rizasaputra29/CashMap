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

        await prisma.transaction.delete({
            where: { id, userId }, 
        });
        return NextResponse.json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        console.error('Transactions DELETE Error:', error);
        return NextResponse.json({ message: 'Failed to delete transaction' }, { status: 500 });
    }
}