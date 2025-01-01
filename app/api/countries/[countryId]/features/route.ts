import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { countryId: string } }
) {
  try {
    const countryId = params.countryId;
    if (!countryId) {
      return NextResponse.json(
        { success: false, message: 'Country ID is required' },
        { status: 400 }
      );
    }

    const countrySelection = await prisma.countrySelection.findFirst({
      where: { country: countryId },
      include: {
        user: {
          include: {
            armies: true,
            gdpManagements: true,
            publicSentiments: true,
            relationships: true,
          },
        },
      },
    });

    if (!countrySelection) {
      return NextResponse.json(
        { success: false, message: 'Country not found' },
        { status: 404 }
      );
    }

    const user = countrySelection.user;
    const army = user.armies[0];
    const gdpManagement = user.gdpManagements[0];
    const sentiment = user.publicSentiments[0];
    const relationships = user.relationships;

    return NextResponse.json(
      {
        success: true,
        message: 'Country features fetched successfully',
        data: {
          army: {
            airForce: army?.airForce || 0,
            navy: army?.navy || 0,
            ground: army?.ground || 0,
            nuclear: army?.nuclear || 0,
          },
          gdp: gdpManagement?.gdp || 0,
          money: 0,
          population: 0,
          sentiment: sentiment?.sentiment || 0,
          relationships: relationships.map((rel: any) => ({
            country: rel.country,
            status: rel.status,
          })),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching country features:', error);
    return NextResponse.json(
      { success: false, message: 'Error while fetching country features' },
      { status: 500 }
    );
  }
}