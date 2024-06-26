import { getServerUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import NewEvent from "./page-client-component";

export default async function NewEventPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");

  return <NewEvent email={user.email}></NewEvent>;
}
