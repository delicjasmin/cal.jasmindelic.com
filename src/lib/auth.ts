import { cookies } from "next/headers";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { jwtVerify } from "jose";
import { users } from "@/db/schema";

export function getJwtSecretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT Secret key is not matched");
  }
  return new TextEncoder().encode(secret);
}

export async function getServerUser() {
  const cookiesStore = cookies();

  const token = cookiesStore.get("token");

  if (!token) return null;

  try {
    const { payload } = await jwtVerify<{ id: string }>(
      token.value,
      getJwtSecretKey()
    );
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.id));

    return user;
  } catch (error) {
    return null;
  }
}
