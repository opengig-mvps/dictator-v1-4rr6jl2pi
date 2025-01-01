import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type ArmyRequestBody = {
  airForce: number;
  navy: number;
  ground: number;
  nuclear: number;
};

export async function POST(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params?.userId;
    const body: ArmyRequestBody = await request.json();

    const { airForce, navy, ground, nuclear } = body;

    const userArmy = await prisma.army.findUnique({
      where: { userId: userId },
    });

    if (!userArmy) {
      return NextResponse.json(
        { success: false, message: 'User army not found' },
        { status: 404 }
      );
    }

    await prisma.army.update({
      where: { id: userArmy?.id }, // Use userArmy.id for the unique identifier
      data: { airForce, navy, ground, nuclear },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Army management updated successfully',
        data: { airForce, navy, ground, nuclear },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating army management:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', data: error },
      { status: 500 }
    );
  }
}