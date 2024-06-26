import { getServerUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Events from "./page-client-component";

export default async function EventsPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");

  return <Events></Events>;
}
