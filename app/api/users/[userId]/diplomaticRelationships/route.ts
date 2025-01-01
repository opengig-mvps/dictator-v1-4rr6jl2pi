import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type DiplomaticRequestBody = {
  country: string;
  status: string;
};

export async function POST(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const body: DiplomaticRequestBody = await request.json();
    const { country, status } = body;

    if (!country || !status) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const existingRelationship = await prisma.diplomaticRelationship.findUnique({
      where: { userId_country: { userId, country } },
    });

    if (existingRelationship) {
      await prisma.diplomaticRelationship.update({
        where: { id: existingRelationship.id },
        data: { status, updatedAt: new Date() },
      });
    } else {
      await prisma.diplomaticRelationship.create({
        data: { userId, country, status },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Diplomatic relationship updated successfully',
        data: { country, status },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Internal server error', data: error },
      { status: 500 }
    );
  }
}