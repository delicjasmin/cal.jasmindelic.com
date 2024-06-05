import { db } from "@/db";
import { contacts, users } from "@/db/schema";
import { getServerUser } from "@/lib/auth";
import { and, eq, like, or } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import uniqid from "uniqid";

export async function GET(req: NextRequest) {
  const inputValue = req.nextUrl.searchParams.get("query");
  const user = await getServerUser();

  if (!user)
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  if (!inputValue)
    return NextResponse.json(
      { result: [], message: "Successful" },
      { status: 200 },
    );
  try {
    const result = await db
      .select({ email: contacts.email })
      .from(contacts)
      .leftJoin(users, eq(contacts.email, users.email))
      .where(
        and(
          eq(contacts.userId, user.id),
          or(
            like(contacts.email, inputValue + "%"),
            like(users.name, inputValue + "%"),
          ),
        ),
      );

    return NextResponse.json(
      { result, message: "Successful." },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const { inputValue } = await req.json();
  const user = await getServerUser();
  if (!user)
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  try {
    await db
      .insert(contacts)
      .values({ email: inputValue, id: uniqid(), userId: user.id });

    return NextResponse.json({ message: "Contact added" }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
