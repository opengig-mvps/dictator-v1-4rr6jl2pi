import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type GDPManagementRequestBody = {
  industries: any;
  taxRates: any;
};

export async function POST(
  request: Request,
  { params }: { params: { userId: string } },
) {
  try {
    const userId = params?.userId;

    const body: GDPManagementRequestBody = await request.json();
    const { industries, taxRates } = body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 },
      );
    }

    await prisma.gDPManagement.updateMany({
      where: { userId },
      data: {
        industries,
        taxRates,
        updatedAt: new Date(),
      },
    });

    const updatedGDPManagement = await prisma.gDPManagement.findFirst({
      where: { userId },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'GDP management updated successfully',
        data: {
          gdp: updatedGDPManagement?.gdp || 0,
          industries: updatedGDPManagement?.industries || {},
          taxRates: updatedGDPManagement?.taxRates || {},
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error('Error updating GDP management:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', data: error },
      { status: 500 },
    );
  }
}