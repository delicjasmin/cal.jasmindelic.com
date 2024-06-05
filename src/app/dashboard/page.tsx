"use server";

import { getServerUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Dashboard from "./page-client-component";

export default async function DashboardPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");

  return <Dashboard />;
}
