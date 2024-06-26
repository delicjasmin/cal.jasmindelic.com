import { db } from "@/db";
import { events } from "@/db/schema";
import { getServerUser } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import uniqid from "uniqid";

export async function GET(req: NextRequest) {
  const user = await getServerUser();

  if (!user)
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const id = req.nextUrl.searchParams.get("query");

  if (id) {
    try {
      const result = await db
        .select()
        .from(events)
        .where(and(eq(events.id, id), eq(events.userId, user.id)));

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

  try {
    const result = await db
      .select()
      .from(events)
      .where(eq(events.userId, user.id));

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

export async function PATCH(req: Request) {
  const user = await getServerUser();

  if (!user)
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const { enabled, id } = await req.json();

  try {
    await db
      .update(events)
      .set({
        enabled,
      })
      .where(and(eq(events.userId, user.id), eq(events.id, id)));

    return NextResponse.json(
      { message: `Event ${enabled ? "enabled" : "disabled"}.` },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const user = await getServerUser();

  if (!user)
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const { duration, link, location, title } = await req.json();

  try {
    await db.insert(events).values({
      id: uniqid(),
      userId: user.id,
      title,
      duration,
      location,
      link,
      enabled: true,
    });

    return NextResponse.json({ message: "Event created." }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  const user = await getServerUser();

  if (!user)
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const { id, duration, link, location, title } = await req.json();

  try {
    await db
      .update(events)
      .set({
        title,
        duration,
        location,
        link,
      })
      .where(and(eq(events.userId, user.id), eq(events.id, id)));

    return NextResponse.json({ message: "Event updated." }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  const user = await getServerUser();

  if (!user)
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const { id } = await req.json();

  try {
    await db
      .delete(events)
      .where(and(eq(events.userId, user.id), eq(events.id, id)));

    return NextResponse.json({ message: "Event deleted." }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
