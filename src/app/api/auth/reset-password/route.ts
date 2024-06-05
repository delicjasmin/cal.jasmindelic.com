import { db } from "@/db";
import { confirmationCodes, users } from "@/db/schema";
import { sendEmail } from "@/lib/sendgrid";
import cryptoRandomString from "crypto-random-string";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import uniqid from "uniqid";

export async function POST(req: Request) {
  const { email } = await req.json();
  const code = cryptoRandomString({ length: 5, type: "numeric" });

  try {
    const [user] = await db
      .select({ name: users.name, id: users.id })
      .from(users)
      .where(eq(users.email, email));

    await db.insert(confirmationCodes).values({
      code,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      id: uniqid(),
      userId: user.id,
    });

    try {
      await sendEmail(email, user.name || "user", code, "reset");
      new Response(JSON.stringify({ message: "Email sent successfully" }), {
        status: 200,
      });
    } catch (error) {
      console.error(error);
      new Response(JSON.stringify({ message: "Internal Server Error" }), {
        status: 500,
      });
    }

    return NextResponse.json(
      { message: "Password reset code was sent" },
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
