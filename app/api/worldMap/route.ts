import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type CountrySelectionResponse = {
  name: string;
  controlledBy: string;
  color: string;
};

export async function GET() {
  try {
    const countrySelections = await prisma.countrySelection.findMany({
      select: {
        country: true,
        color: true,
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    const countries: CountrySelectionResponse[] = countrySelections.map((selection: any) => ({
      name: selection.country,
      controlledBy: selection.user.username,
      color: selection.color,
    }));

    return NextResponse.json(
      {
        success: true,
        message: 'World map data fetched successfully',
        data: { countries },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error('Error fetching world map data:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', data: error },
      { status: 500 },
    );
  }
}