"use server";
import { getServerUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import ResetPassword from "./page-client-component";

export default async function Page() {
  const user = await getServerUser();

  if (user) redirect("/");

  return <ResetPassword />;
}
