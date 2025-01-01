import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { storyId: string } },
): Promise<NextResponse> {
  try {
    const story = await prisma?.story?.findUnique({
      where: { id: params?.storyId },
      select: {
        id: true,
        title: true,
        content: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!story) {
      return NextResponse.json(
        { success: false, message: 'Story not found' },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Story fetched successfully',
        data: {
          id: story?.id,
          title: story?.title,
          content: story?.content,
          imageUrl: story?.imageUrl,
          createdAt: story?.createdAt?.toISOString(),
          updatedAt: story?.updatedAt?.toISOString(),
        },
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

export async function PUT(
  request: Request,
  { params }: { params: { storyId: string } },
): Promise<NextResponse> {
  try {
    const storyId = params?.storyId;
    const body: any = await request.json();
    const { title, content, imageUrl } = body;

    if (!title || !content) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 },
      );
    }

    const updatedStory = await prisma?.story?.update({
      where: { id: storyId },
      data: {
        title: String(title),
        content: String(content),
        imageUrl: imageUrl ? String(imageUrl) : undefined,
      },
      select: {
        id: true,
        title: true,
        content: true,
        imageUrl: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Story updated successfully',
        data: {
          id: updatedStory?.id,
          title: updatedStory?.title,
          content: updatedStory?.content,
          imageUrl: updatedStory?.imageUrl,
          updatedAt: updatedStory?.updatedAt?.toISOString(),
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json(
        { success: false, message: 'Story not found' },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 },
    );
  }
}