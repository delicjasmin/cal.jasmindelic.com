import { db } from "@/db";
import { confirmationCodes, users } from "@/db/schema";
import { sendEmail } from "@/lib/sendgrid";
import bcrypt from "bcrypt";
import cryptoRandomString from "crypto-random-string";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import uniqid from "uniqid";

export async function POST(req: Request) {
  const { email, password, name } = await req.json();
  const code = cryptoRandomString({ length: 5, type: "numeric" });
  const hashedPassword = await bcrypt.hash(password, 10);
  const id = uniqid();

  const [user] = await db.select().from(users).where(eq(users.email, email));

  if (user) {
    if (user.emailVerifiedAt) {
      return NextResponse.json(
        { error: { message: "Email already in use." } },
        { status: 400 },
      );
    } else if (!user.emailVerifiedAt) {
      await db.transaction(async (tx) => {
        await tx
          .update(users)
          .set({ id, name, password: hashedPassword })
          .where(eq(users.email, email));

        await tx.insert(confirmationCodes).values({
          code,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
          id: uniqid(),
          userId: id,
        });
      });

      return NextResponse.json(
        { message: "Signup successful" },
        { status: 201 },
      );
    }
  }
  try {
    await db.transaction(async (tx) => {
      await tx.insert(users).values({
        email,
        id,
        name,
        password: hashedPassword,
      });
      await tx.insert(confirmationCodes).values({
        code,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        id: uniqid(),
        userId: id,
      });
    });

    try {
      await sendEmail(email, name, code, "signup");
      new Response(JSON.stringify({ message: "Email sent successfully" }), {
        status: 200,
      });
    } catch (error) {
      console.error(error);
      new Response(JSON.stringify({ message: "Internal Server Error" }), {
        status: 500,
      });
    }

    return NextResponse.json({ message: "Signup successful" }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: { message: "Signup failed" } },
      { status: 500 },
    );
  }
}
