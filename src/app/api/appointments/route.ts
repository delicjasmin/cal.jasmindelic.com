import { db } from "@/db";
import { appointments, contacts, participants } from "@/db/schema";
import { getServerUser } from "@/lib/auth";
import dayjs from "dayjs";
import { and, eq, gt, gte, lt, or } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import uniqid from "uniqid";

export async function GET(req: NextRequest) {
  const date = dayjs(req.nextUrl.searchParams.get("query")).toDate();
  const user = await getServerUser();

  if (!user)
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  try {
    const allParticipants = await db
      .select({
        id: participants.id,
        appointmentId: participants.appointmentId,
        email: participants.email,
      })
      .from(appointments)
      .leftJoin(participants, eq(appointments.id, participants.appointmentId))
      .where(eq(appointments.userId, user.id));

    const allAppointments = await db
      .select()
      .from(appointments)
      .where(
        or(
          and(
            eq(appointments.userId, user.id),
            gte(appointments.startsAt, date),
            lt(appointments.startsAt, dayjs(date).add(1, "day").toDate()),
          ),
          and(
            eq(appointments.userId, user.id),
            lt(appointments.startsAt, date),
            gt(appointments.endsAt, date),
          ),
        ),
      );

    const sortedAppointments = allAppointments
      .map((app) => ({
        ...app,
        participants: allParticipants.filter(
          (participant) => participant.appointmentId === app.id,
        ),
        startsAt: !app.startsAt || date > app.startsAt ? date : app.startsAt,
      }))
      .sort((a, b) => {
        if (dayjs(a.startsAt).isAfter(b.startsAt)) return 1;
        if (
          dayjs(a.startsAt).isBefore(b.startsAt) ||
          dayjs(a.endsAt).isBefore(b.endsAt)
        )
          return -1;
        return 0;
      });

    return NextResponse.json(
      { sortedAppointments, message: "Successful." },
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
  const {
    contactsArray,
    description,
    endsAt,
    location,
    participantsArray,
    startsAt,
    title,
  } = await req.json();
  const id = uniqid();
  const user = await getServerUser();
  if (!user)
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  try {
    await db.transaction(async (tx) => {
      await tx.insert(appointments).values({
        description,
        endsAt: new Date(endsAt),
        id,
        location,
        startsAt: new Date(startsAt),
        title,
        userId: user.id,
      });

      if (participantsArray.length > 0)
        await tx.insert(participants).values(
          participantsArray.map((participant: string) => ({
            appointmentId: id,
            email: participant,
            id: uniqid(),
          })),
        );

      if (contactsArray.length > 0)
        await tx.insert(contacts).values(
          contactsArray.map((contact: string) => ({
            email: contact,
            id: uniqid(),
            userId: user.id,
          })),
        );
    });

    return NextResponse.json(
      { message: "Appointment created" },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  const {
    appId,
    contactsArray,
    description,
    endsAt,
    location,
    participantsArray,
    startsAt,
    title,
  } = await req.json();
  const user = await getServerUser();
  if (!user)
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const currentParticipants = await db
    .select({
      id: participants.id,
      appointmentId: participants.appointmentId,
      email: participants.email,
    })
    .from(participants)
    .where(eq(participants.appointmentId, appId));

  const currentParticipantsEmails = currentParticipants.map((p) => p.email);

  const addedParticipants = participantsArray.filter((p: string) => {
    if (!currentParticipantsEmails.includes(p)) return p;
  });

  const removedParticipants = currentParticipants.filter((p) => {
    if (!participantsArray.includes(p.email)) return p;
  });

  try {
    await db.transaction(async (tx) => {
      await tx
        .update(appointments)
        .set({
          description,
          endsAt: new Date(endsAt),
          location,
          startsAt: new Date(startsAt),
          title,
          userId: user.id,
        })
        .where(eq(appointments.id, appId));

      if (addedParticipants.length > 0)
        await tx.insert(participants).values(
          addedParticipants.map((participant: string) => ({
            appointmentId: appId,
            email: participant,
            id: uniqid(),
          })),
        );

      if (removedParticipants.length > 0) {
        for (const participant of removedParticipants) {
          await tx
            .delete(participants)
            .where(
              and(
                eq(participants.appointmentId, participant.appointmentId!),
                eq(participants.email, participant.email!),
              ),
            );
        }
      }

      if (contactsArray.length > 0)
        await tx.insert(contacts).values(
          contactsArray.map((contact: string) => ({
            email: contact,
            id: uniqid(),
            userId: user.id,
          })),
        );
    });

    return NextResponse.json(
      { message: "Appointment created" },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  const { id } = await req.json();

  try {
    await db.transaction(async (tx) => {
      await tx.delete(appointments).where(eq(appointments.id, id));
      await tx.delete(participants).where(eq(participants.appointmentId, id));
    });

    return NextResponse.json({ message: "Successful." }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
