import { db } from "@/db";
import { confirmationCodes, users } from "@/db/schema";
import { and, eq, gt, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, code } = await req.json();
  const currentTime = new Date();

  try {
    const confirmation = await db
      .select()
      .from(confirmationCodes)
      .where(
        and(
          eq(confirmationCodes.code, code),
          gt(confirmationCodes.expiresAt, currentTime),
          isNull(confirmationCodes.usedAt),
        ),
      );

    if (confirmation.length) {
      await db
        .update(confirmationCodes)
        .set({ usedAt: currentTime })
        .where(
          and(
            eq(confirmationCodes.code, code),
            gt(confirmationCodes.expiresAt, currentTime),
          ),
        );

      await db
        .update(users)
        .set({ emailVerifiedAt: currentTime })
        .where(eq(users.email, email));

      return NextResponse.json(
        { message: "Email confirmed successfully." },
        { status: 200 },
      );
    } else
      return NextResponse.json(
        { error: { message: "Invalid code", code: "CODE_INVALID" } },
        { status: 400 },
      );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: { message: "Email confirmation failed." } },
      { status: 500 },
    );
  }
}
