"use client";

import AvailableDates from "@/app/_components/events/available-dates";
import AvailableTimes from "@/app/_components/events/available-times";
import SignupForm from "@/app/_components/events/signup-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useMemo, useState } from "react";
import { EventType } from "../../all-events";
import { EventAvailabilityType } from "../../edit/[id]/page-client-component";

dayjs.extend(isSameOrBefore);
dayjs.extend(timezone);
dayjs.extend(utc);

const getAppointmentsRequest = async (date: Date, userId: string) => {
  const queryParams = new URLSearchParams({
    query: date.toISOString(),
    userId,
  });

  const res = await fetch(`/api/appointments/by-date?${queryParams}`);

  const result = await res.json();
  if (result.error) {
    const error = new Error(result.error.message || "Unknown error");
    throw error;
  }

  return result;
};

const newAppointmentRequest = async (data: {
  contactsArray: string[];
  description: string;
  endsAt: Date;
  location: string;
  startsAt: Date;
  participantsArray: string[];
  title: string;
}) => {
  const reqParams = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };

  const res = await fetch("/api/appointments", reqParams);

  const result = await res.json();
  if (result.error) {
    const error = new Error(result.error.message || "Unkown error");
    // error.code = result.error.code || 'UNKNOWN_ERROR';
    throw error;
  }

  return result;
};

type Appointment = {
  userId: string | null;
  startsAt: Date | null;
  endsAt: Date | null;
  title: string | null;
  id: string;
  location: string | null;
  description: string | null;
};

export default function EventSignup({
  event,
  eventAvailability,
  username,
}: {
  event: EventType;
  eventAvailability: EventAvailabilityType;
  username: string | null;
}) {
  const description = "Short descriptive description describing the event";
  const [email, setEmail] = useState("");
  const [selectedTime, setSelectedTime] = useState<number | null>(null);
  const [timeFormat, setTimeFormat] = useState<"12h" | "24h">("12h");
  const [timezone, setTimezone] = useState<string>(
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  );

  const disabledDays = useMemo(() => {
    return eventAvailability
      .filter((availability) => !availability.enabled)
      .map((availability) => availability.dayIndex);
  }, [eventAvailability]);

  const enabledDays = useMemo(() => {
    return eventAvailability
      .filter((availability) => availability.enabled)
      .map((availability) => availability.dayIndex);
  }, [eventAvailability]);

  const firstAvailableDate = useMemo(() => {
    const today = dayjs();
    const dayIndex = today.day();

    const nextAvailableDay =
      enabledDays.find((day) => day > dayIndex) ?? enabledDays[0];

    const diff =
      nextAvailableDay >= dayIndex
        ? nextAvailableDay - dayIndex
        : 7 - (dayIndex - nextAvailableDay);

    return today.add(diff, "day").startOf("day").toDate();
  }, [enabledDays]);

  const [selectedDate, setSelectedDate] = useState<Date>(firstAvailableDate);

  const query = useQuery({
    queryKey: ["appointmentsByDate", selectedDate, event.userId],
    queryFn: () => getAppointmentsRequest(selectedDate, event.userId),
  });

  const availableTimes = useMemo(() => {
    const selectedDay = selectedDate.getDay();
    const eventTimezone = event.timezone;
    const now = dayjs().tz(eventTimezone);
    const dayAvailability = eventAvailability.find(
      (availability) => availability.dayIndex === selectedDay,
    );

    if (!dayAvailability || !dayAvailability.enabled) return [];

    const { startTime, endTime } = dayAvailability;
    const durationInMinutes = parseInt(event.duration, 10);
    const times = [];

    const startUtc = dayjs
      .tz(`${dayjs(selectedDate).format("YYYY-MM-DD")}T00:00`, eventTimezone)
      .add(startTime, "minutes")
      .utc();

    const endUtc = dayjs
      .tz(`${dayjs(selectedDate).format("YYYY-MM-DD")}T00:00`, eventTimezone)
      .add(endTime, "minutes")
      .utc();

    if (!query.data) return [];

    for (
      let time = startUtc;
      time.add(durationInMinutes, "minutes").isSameOrBefore(endUtc);
      time = time.add(durationInMinutes, "minutes")
    ) {
      const localTime = time.tz(timezone);

      // Skip past times if the selected date is today
      if (dayjs(selectedDate).isSame(now, "day") && localTime.isBefore(now)) {
        continue;
      }

      // Check for overlaps with appointments
      const overlaps = query.data.allAppointments.some(
        (appointment: Appointment) => {
          const appointmentStart = dayjs(appointment.startsAt).utc();
          const appointmentEnd = dayjs(appointment.endsAt).utc();
          return (
            time.isBefore(appointmentEnd) &&
            time.add(durationInMinutes, "minutes").isAfter(appointmentStart)
          );
        },
      );

      if (overlaps) continue;

      times.push({
        display12: localTime.format("h:mma"),
        display24: localTime.format("HH:mm"),
        offset: localTime.diff(localTime.startOf("day"), "minutes"),
      });
    }

    return times;
  }, [selectedDate, event, eventAvailability, query, timezone]);

  const createAppointment = useMutation({
    mutationFn: newAppointmentRequest,
  });

  const onCreateAppointment = () => {
    const startsAt = dayjs(selectedDate).add(selectedTime!, "minutes").toDate();
    const endsAt = dayjs(startsAt)
      .add(parseInt(event.duration, 10), "minutes")
      .toDate();

    const requestData = {
      contactsArray: [],
      description,
      endsAt,
      location: event.location,
      participantsArray: [email],
      startsAt,
      title: event.title,
    };
    createAppointment
      .mutateAsync(requestData)
      // .then(() => form.reset())
      // .then(() => queryClient.invalidateQueries({ queryKey: ["appointments"] }))
      .catch(console.warn);
  };

  return (
    <main className="mx-auto max-w-full px-4 py-10 md:max-w-[1920px] md:p-10 lg:px-20 xl:px-32">
      <div className="flex flex-col rounded-lg border border-black">
        <div className="flex h-auto flex-col lg:h-[48rem] lg:flex-row">
          <SignupForm
            description={description}
            duration={event.duration}
            email={email}
            location={event.location}
            onCreateAppointment={onCreateAppointment}
            setEmail={setEmail}
            setTimezone={setTimezone}
            timezone={timezone}
            title={event.title}
            username={username}
          />

          <AvailableDates
            disabledDays={disabledDays}
            enabledDays={enabledDays}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            setSelectedTime={setSelectedTime}
          />

          <AvailableTimes
            availableTimes={availableTimes}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            setSelectedTime={setSelectedTime}
            setTimeFormat={setTimeFormat}
            timeFormat={timeFormat}
          />
        </div>
      </div>
    </main>
  );
}
