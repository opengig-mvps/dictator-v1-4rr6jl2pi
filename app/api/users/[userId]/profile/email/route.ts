import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/authOptions';
import { sendEmail } from '@/lib/email-service';

export async function POST(
  request: Request,
  { params }: { params: { userId: string } },
) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 },
      );
    }

    const userId: string = params.userId;
    if (session.user.id !== userId) {
      return NextResponse.json(
        { success: false, message: 'Forbidden' },
        { status: 403 },
      );
    }

    const body: any = await request.json();
    const newEmail: string = String(body.newEmail);

    if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: newEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Email already in use' },
        { status: 400 },
      );
    }

    await prisma.user.update({
      where: { id: userId },
      data: { email: newEmail },
    });

    await sendEmail({
      to: newEmail,
      template: {
        subject: 'Verify your new email',
        html: '<h1>Please verify your new email</h1>',
        text: 'Please verify your new email',
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Email updated successfully. Please verify your new email.',
        data: { email: newEmail },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error('Error updating email:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 },
    );
  }
}