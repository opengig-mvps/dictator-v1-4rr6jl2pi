import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/email-service';

type CaptureRequestBody = {
  country: string;
};

export async function POST(
  request: Request,
  { params }: { params: { userId: string } },
) {
  try {
    const userId = params.userId;
    const body: CaptureRequestBody = await request.json();
    const { country } = body;

    if (!country) {
      return NextResponse.json(
        { success: false, message: 'Country is required' },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 },
      );
    }

    if (user.role !== 'player') {
      return NextResponse.json(
        { success: false, message: 'User is not authorized' },
        { status: 403 },
      );
    }

    const existingCapture = await prisma.capture.findFirst({
      where: { userId, country },
    });

    if (existingCapture) {
      return NextResponse.json(
        { success: false, message: 'Country already captured' },
        { status: 400 },
      );
    }

    const resources = { gold: 100, oil: 50 };

    const capture = await prisma.capture.create({
      data: {
        userId,
        country,
        resources,
      },
    });

    await sendEmail({
      to: user.email,
      template: {
        subject: 'Country Captured Successfully',
        html: `<h1>Congratulations!</h1><p>You have successfully captured ${country}.</p>`,
        text: `Congratulations! You have successfully captured ${country}.`,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Country captured successfully',
        data: {
          country: capture.country,
          resources: capture.resources,
        },
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error('Error capturing country:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', data: error },
      { status: 500 },
    );
  }
}