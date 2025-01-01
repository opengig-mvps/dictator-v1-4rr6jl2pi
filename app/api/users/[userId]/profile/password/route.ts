import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { getAuthSession } from '@/lib/authOptions';

interface Params {
  userId: string;
}

interface RequestBody {
  currentPassword: string;
  newPassword: string;
}

export async function POST(
  request: Request,
  { params }: { params: Params },
) {
  try {
    const session = await getAuthSession();
    if (!session || session.user.id !== params.userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 },
      );
    }

    const body: RequestBody = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: params.userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 },
      );
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password || '');
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Current password is incorrect' },
        { status: 400 },
      );
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: params.userId },
      data: { password: hashedNewPassword },
    });

    return NextResponse.json(
      { success: true, message: 'Password updated successfully', data: {} },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 },
    );
  }
}