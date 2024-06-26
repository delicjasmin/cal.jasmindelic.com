"use server";

import { getServerUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Home from "./page-client-component";

export default async function HomePage() {
  const user = await getServerUser();

  if (!user) redirect("/login");

  return <Home />;
}
