import { db } from "@/db";
import { users } from "@/db/schema";
import { getJwtSecretKey } from "@/lib/auth";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { SignJWT } from "jose";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  try {
    const [user] = await db.select().from(users).where(eq(users.email, email));

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (passwordMatches) {
      const token = await new SignJWT({
        id: user.id,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("30d")
        .sign(getJwtSecretKey());

      const response = NextResponse.json(
        { message: "Login successful", success: true },
        { status: 200, headers: { "content-type": "application/json" } },
      );

      response.cookies.set({
        maxAge: 60 * 60 * 24 * 30,
        name: "token",
        path: "/",
        value: token,
      });

      return response;
    } else {
      return NextResponse.json(
        { error: { message: "Email or password is incorrect" } },
        { status: 401 },
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: { message: "Internal Server Error" } },
      { status: 500 },
    );
  }
}
