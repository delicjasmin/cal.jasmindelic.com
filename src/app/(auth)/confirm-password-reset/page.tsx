"use server";
import ConfirmPasswordReset from "./page-client-component";
import { redirect } from "next/navigation";

export default async function Page({
  searchParams,
}: {
  searchParams: { email: string };
}) {
  if (!searchParams.email) redirect("/reset-password");

  return <ConfirmPasswordReset email={searchParams.email} />;
}
