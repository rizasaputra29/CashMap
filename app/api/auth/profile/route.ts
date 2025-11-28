import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ClientUser, hashPassword, comparePassword } from '@/lib/auth';
import { cookies } from 'next/headers'; // Import penting!

// Helper untuk mendapatkan userId dari Cookie (khusus route ini)
async function getAuthUser() {
    const cookieStore = await cookies();
    const userId = cookieStore.get('session_token_mock')?.value;
    return userId;
}

// GET: Get User Profile
export async function GET(request: Request) {
  try {
    // Baca user ID langsung dari cookie karena middleware skip path ini
    const userId = await getAuthUser();

    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, fullName: true, avatarUrl: true }, 
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user as ClientUser);
  } catch (error) {
    console.error('GET Profile Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT: Update User Profile
export async function PUT(request: Request) {
  try {
    const userId = await getAuthUser();

    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const dataToUpdate = await request.json();
    const { fullName, avatarUrl } = dataToUpdate;
    const updateData: { fullName?: string; avatarUrl?: string } = {};

    if (fullName) updateData.fullName = fullName;
    if (avatarUrl) updateData.avatarUrl = avatarUrl;
    
    if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ message: 'No valid fields' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, email: true, fullName: true, avatarUrl: true }, 
    });

    return NextResponse.json(updatedUser as ClientUser);
  } catch (error) {
    console.error('PUT Profile Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Forgot Password (PUBLIC ROUTE - No Auth Needed)
export async function POST(request: Request) {
  try {
    const { email, securityAnswer, newPassword } = await request.json();

    if (!email || !securityAnswer || !newPassword) {
        return NextResponse.json({ message: 'All fields required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ 
        where: { email },
        select: { id: true, securityAnswer: true } 
    });
    
    if (!user) {
        return NextResponse.json({ message: 'Reset failed' }, { status: 400 });
    }
    
    const answerValid = await comparePassword(securityAnswer, user.securityAnswer);
    
    if (answerValid) {
        const hashedPassword = await hashPassword(newPassword); 
        
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }, 
        });

        return NextResponse.json({ message: 'Password reset successful' });
    } else {
        return NextResponse.json({ message: 'Reset failed' }, { status: 400 }); 
    }
  } catch (error) {
    console.error('Forgot Password Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}