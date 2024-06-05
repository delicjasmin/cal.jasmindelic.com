import { db } from "@/db";
import { confirmationCodes, users } from "@/db/schema";
import bcrypt from "bcrypt";
import { and, eq, gt, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, code, password } = await req.json();
  const hashedPassword = await bcrypt.hash(password, 10);
  const timestamp = new Date();

  try {
    const confirmation = await db
      .select()
      .from(confirmationCodes)
      .where(
        and(
          eq(confirmationCodes.code, code),
          gt(confirmationCodes.expiresAt, timestamp),
          isNull(confirmationCodes.usedAt),
        ),
      );

    if (confirmation.length) {
      await db.transaction(async (tx) => {
        await tx
          .update(users)
          .set({ password: hashedPassword })
          .where(eq(users.email, email));

        await tx
          .update(confirmationCodes)
          .set({ usedAt: timestamp })
          .where(
            and(
              eq(confirmationCodes.code, code),
              isNull(confirmationCodes.usedAt),
            ),
          );
      });
    }

    return NextResponse.json(
      { message: "Password changed successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
