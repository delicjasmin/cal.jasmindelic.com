import { getServerUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import EditEvent from "./page-client-component";
import { events } from "@/db/schema";
import { eq } from "drizzle-orm";
import { db } from "@/db";

export default async function EditEventPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getServerUser();
  if (!user) redirect("/login");

  const { id } = params;
  try {
    const [event] = await db.select().from(events).where(eq(events.id, id));

    return <EditEvent email={user.email} id={id} event={event}></EditEvent>;
  } catch (error) {
    redirect("/dashboard/events");
  }
}
