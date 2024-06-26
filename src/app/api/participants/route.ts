import { db } from "@/db";
import { participants } from "@/db/schema";
import { NextResponse } from "next/server";
import uniqid from "uniqid";

export async function POST(req: Request) {
  const { id, email } = await req.json();

  try {
    await db.insert(participants).values({
      appointmentId: id,
      email,
      id: uniqid(),
    });

    return NextResponse.json({ message: "Participant added" }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
