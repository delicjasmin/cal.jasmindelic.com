import { db } from "@/db";
import { eventAvailability, events } from "@/db/schema";
import { getServerUser } from "@/lib/auth";
import cryptoRandomString from "crypto-random-string";
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

  const {
    duration,
    link,
    location,
    title,
    monday,
    tuesday,
    wednesday,
    thursday,
    friday,
    saturday,
    sunday,
    timezone,
  } = await req.json();

  const availability = [
    monday,
    tuesday,
    wednesday,
    thursday,
    friday,
    saturday,
    sunday,
  ];

  const id = uniqid();

  try {
    await db.transaction(async (tx) => {
      await tx.insert(events).values({
        id,
        userId: user.id,
        title: title || "Untitled",
        duration: duration || 15,
        location: location || "Unknown",
        link: link || cryptoRandomString({ length: 9, type: "url-safe" }),
        enabled: true,
        timezone: timezone || "eet",
      });

      await tx.insert(eventAvailability).values(
        availability.map((day) => ({
          id: uniqid(),
          eventId: id,
          enabled: day.enabled,
          startTimeMinuteOffset: day.startTime,
          endTimeMinuteOffset: day.endTime,
          day: day.day,
        })),
      );
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

  const {
    id,
    duration,
    link,
    location,
    title,
    monday,
    tuesday,
    wednesday,
    thursday,
    friday,
    saturday,
    sunday,
    timezone,
  } = await req.json();

  const availability = [
    monday,
    tuesday,
    wednesday,
    thursday,
    friday,
    saturday,
    sunday,
  ];

  try {
    await db.transaction(async (tx) => {
      await tx
        .update(events)
        .set({
          title,
          duration,
          location,
          link,
        })
        .where(eq(events.id, id));

      await Promise.all(
        availability.map((day) =>
          tx
            .update(eventAvailability)
            .set({
              enabled: day.enabled,
              startTimeMinuteOffset: day.startTime,
              endTimeMinuteOffset: day.endTime,
              day: day.day,
            })
            .where(
              and(
                eq(eventAvailability.eventId, id),
                eq(eventAvailability.day, day.day),
              ),
            ),
        ),
      );
    });

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
