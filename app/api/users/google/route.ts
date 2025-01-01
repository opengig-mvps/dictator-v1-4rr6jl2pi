import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { OAuth2Client } from "google-auth-library";

const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

type GoogleAuthRequestBody = {
  idToken: string;
};

export async function authenticateUser(req: NextRequest) {
  const { email, name } = await req.json();

  try {
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          username: email.split("@")[0],
        },
      });
    }

    const token = jwt.sign(
      {
        id: user?.id,
        username: user?.username,
        email: user?.email,
        role: user?.role,
      },
      SECRET_KEY,
      { expiresIn: "10d" }
    );

    return NextResponse.json(
      {
        success: true,
        message: "User successfully authenticated",
        data: { user, token },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: "Error processing request",
      },
      { status: 500 }
    );
  }
}

export async function googleAuth(request: NextRequest) {
  try {
    const body: GoogleAuthRequestBody = await request.json();
    const { idToken } = body;

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket?.getPayload();
    if (!payload) {
      return NextResponse.json(
        { success: false, message: "Invalid Google token" },
        { status: 400 }
      );
    }

    const { sub: googleId, email, name } = payload;

    let user = await prisma.user.findFirst({
      where: { email: email as string },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: email as string,
          username: email?.split("@")[0] as string,
          name: name as string,
          googleAuthToken: idToken,
        },
      });
    } else {
      await prisma.user.updateMany({
        where: { email: email as string },
        data: { googleAuthToken: idToken },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "User authenticated successfully",
        data: {
          userId: user?.id,
          name: user?.name,
          email: user?.email,
          googleAuthToken: user?.googleAuthToken,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error authenticating user:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error", data: error },
      { status: 500 }
    );
  }
}