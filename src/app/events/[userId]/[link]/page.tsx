import { db } from "@/db";
import { eventAvailability, events, users } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import EventSignup from "./page-client-component";

export default async function EventSignupPage({
  params,
}: {
  params: { userId: string; link: string };
}) {
  const { link, userId } = params;

  try {
    const [event] = await db
      .select()
      .from(events)
      .where(and(eq(events.link, link), eq(events.userId, userId)));

    const eventAvail = await db
      .select({
        enabled: eventAvailability.enabled,
        startTime: eventAvailability.startTimeMinuteOffset,
        endTime: eventAvailability.endTimeMinuteOffset,
        day: eventAvailability.day,
        dayIndex: eventAvailability.dayIndex,
      })
      .from(eventAvailability)
      .where(eq(eventAvailability.eventId, event?.id));

    const [user] = await db
      .select({ username: users.name })
      .from(users)
      .where(eq(users.id, userId));

    return (
      <EventSignup
        event={event}
        eventAvailability={eventAvail}
        username={user.username}
      />
    );
  } catch (error) {
    redirect("/");
  }
}
