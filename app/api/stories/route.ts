import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/authOptions';

type StoryRequestBody = {
  title: string;
  content: string;
  imageUrl?: string;
};

export async function POST(request: Request) {
  try {
    const session: any = await getAuthSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: StoryRequestBody = await request.json();
    const { title, content, imageUrl } = body;

    if (!title || !content) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const story = await prisma.story.create({
      data: {
        title: String(title),
        content: String(content),
        imageUrl: imageUrl ? String(imageUrl) : null,
        userId: session.user.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Story created successfully',
        data: {
          id: story.id,
          title: story.title,
          content: story.content,
          imageUrl: story.imageUrl,
          createdAt: story.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page: number = parseInt(searchParams.get('page') || '1', 10);
    const limit: number = parseInt(searchParams.get('limit') || '10', 10);
    const skip: number = (page - 1) * limit;

    const stories: any = await prisma.story.findMany({
      skip,
      take: limit,
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

    return NextResponse.json({
      success: true,
      message: 'Stories fetched successfully',
      data: formattedStories,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}