import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type CountrySelectionRequestBody = {
  country: string;
  color: string;
};

export async function POST(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;
    const body: CountrySelectionRequestBody = await request.json();
    const { country, color } = body;

    if (!country || !color) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const existingColor = await prisma.countrySelection.findFirst({
      where: { color },
    });

    if (existingColor) {
      return NextResponse.json(
        { success: false, message: 'Color already taken by another player' },
        { status: 409 }
      );
    }

    const countrySelection = await prisma.countrySelection.create({
      data: {
        userId,
        country,
        color,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Country and color selection saved successfully',
        data: { country: countrySelection.country, color: countrySelection.color },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error saving country selection:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}