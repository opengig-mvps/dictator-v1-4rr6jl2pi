import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword') || '';

    const stories = await prisma.story.findMany({
      where: {
        OR: [
          { title: { contains: keyword, mode: 'insensitive' } },
          { content: { contains: keyword, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        title: true,
        content: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const formattedStories = stories.map((story: any) => ({
      id: story.id,
      title: story.title,
      content: story.content,
      imageUrl: story.imageUrl,
      createdAt: story.createdAt.toISOString(),
      updatedAt: story.updatedAt.toISOString(),
    }));

    return NextResponse.json(
      {
        success: true,
        message: 'Stories searched successfully',
        data: formattedStories,
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