import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { userId: string } },
) {
  try {
    const userId = params.userId;

    const sentimentData = await prisma.publicSentiment.findFirst({
      where: { userId: userId },
      select: {
        sentiment: true,
        rebellion: true,
      },
    });

    if (!sentimentData) {
      return NextResponse.json(
        { success: false, message: 'No public sentiment data found for user' },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Public sentiment data fetched successfully',
        data: sentimentData,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error('Error fetching public sentiment data:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 },
    );
  }
}