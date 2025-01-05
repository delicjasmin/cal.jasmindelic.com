import { db } from "@/db";
import { appointments } from "@/db/schema";
import dayjs from "dayjs";
import { and, eq, gt, gte, lt, or } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const date = dayjs(req.nextUrl.searchParams.get("query")).toDate();
  const userId = req.nextUrl.searchParams.get("userId");

  if (!userId)
    return NextResponse.json({ message: "Bad request" }, { status: 400 });

  // const user = await getServerUser();

  // if (!user)
  //   return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  try {
    const allAppointments = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.userId, userId),
          or(
            and(
              gte(appointments.startsAt, date),
              lt(appointments.startsAt, dayjs(date).add(1, "day").toDate()),
            ),
            and(lt(appointments.startsAt, date), gt(appointments.endsAt, date)),
          ),
        ),
      );

    return NextResponse.json(
      { allAppointments, message: "Successful." },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
