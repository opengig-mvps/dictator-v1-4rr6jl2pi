import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type RandomEvent = {
  eventType: string;
  impact: any;
};

const generateRandomEvent = (): RandomEvent => {
  const eventTypes = ['attack', 'disaster', 'economic shift'];
  const randomIndex = Math.floor(Math.random() * eventTypes.length);
  const eventType = eventTypes[randomIndex];

  const impact = {
    attack: { damage: Math.random() * 100 },
    disaster: { severity: Math.random() * 100 },
    economicShift: { change: Math.random() * 100 },
  };

  return {
    eventType,
    impact: impact[eventType.replace(' ', '') as keyof typeof impact],
  };
};

export async function POST(
  request: Request,
  { params }: { params: { userId: string } },
) {
  try {
    const userId = params?.userId;
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
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

    const randomEvent = generateRandomEvent();

    const event = await prisma.randomEvent.create({
      data: {
        userId,
        eventType: randomEvent?.eventType,
        impact: randomEvent?.impact,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Random event generated',
        data: {
          eventType: event?.eventType,
          impact: event?.impact,
        },
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error('Error generating random event:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 },
    );
  }
}