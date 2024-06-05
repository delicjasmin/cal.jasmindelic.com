import { db } from "@/db";
import { participants, users } from "@/db/schema";
import { getServerUser } from "@/lib/auth";
import { eq, like, or } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import uniqid from "uniqid";

// export async function GET(req: NextRequest) {
//   const inputValue = req.nextUrl.searchParams.get("query");
//   const user = await getServerUser();

//   if (!user)
//     return NextResponse.json({ message: "Forbidden" }, { status: 403 });
//   if (!inputValue)
//     return NextResponse.json(
//       { result: [], message: "Successful" },
//       { status: 200 },
//     );

//   try {
//     const result = await db
//       .select({ email: participants.email })
//       .from(participants)
//       .leftJoin(users, eq(users.email, participants.email))
//       .where(
//         or(
//           like(participants.email, inputValue + "%"),
//           like(users.name, inputValue + "%"),
//         ),
//       );

//     return NextResponse.json(
//       { result, message: "Successful." },
//       { status: 200 },
//     );
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json(
//       { message: "Internal Server Error" },
//       { status: 500 },
//     );
//   }
// }

export async function POST(req: Request) {
  const { id, email } = await req.json();

  try {
    await db.insert(participants).values({
      appointmentId: id,
      email,
      id: uniqid(),
    });

    return NextResponse.json({ message: "Participant added" }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
