"use server";
import ConfirmEmail from "./page-client-component";
import { redirect } from "next/navigation";

export default async function Page({
  searchParams,
}: {
  searchParams: { email: string };
}) {
  if (!searchParams.email) redirect("/signup");

  return <ConfirmEmail email={searchParams.email} />;
}
