"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MoveLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import AllEvents from "./all-events";
import AllAppointments from "./all-appointments";

export default function Events() {
  const router = useRouter();

  return (
    <>
      <header className="sticky top-0 z-50 flex w-full items-center bg-white shadow-md">
        <nav className="max-w-8xl mx-auto flex h-16 w-full items-center justify-between border-b-2 p-2 px-20">
          <MoveLeft
            onClick={() => router.push("/dashboard")}
            className="h-6 w-8 hover:cursor-pointer"
          />
        </nav>
      </header>

      <Tabs defaultValue="events" className="m-14 mx-auto w-full px-20">
        <TabsList className="flex justify-between rounded-none border-b-2 p-6">
          <div>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          </div>
          <Button onClick={() => router.push("/events/new")}>New Event</Button>
        </TabsList>
        <TabsContent value="events">
          <AllEvents></AllEvents>
        </TabsContent>
        <TabsContent value="scheduled">
          <AllAppointments></AllAppointments>
        </TabsContent>
      </Tabs>
    </>
  );
}
