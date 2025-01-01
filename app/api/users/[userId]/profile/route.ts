import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/authOptions';

interface Params {
  params: {
    userId: string;
  };
}

export async function GET(request: Request, { params }: Params) {
  try {
    const session: any = await getAuthSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 },
      );
    }

    const profileData: any = {
      email: user.email,
      username: user.username,
      name: user.name || '',
      bio: user.profile?.bio || '',
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Profile fetched successfully',
        data: profileData,
      },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 },
    );
  }
}