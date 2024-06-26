import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Appointment } from "../dashboard/all-appointments";
import { truncate } from "lodash";
import { format } from "date-fns";

const getAppointmentsRequest = async (date: Date) => {
  const res = await fetch("/api/appointments?query=" + date.toISOString());

  const result = await res.json();
  if (result.error) {
    const error = new Error(result.error.message || "Unkown error");
    // error.code = result.error.code || 'UNKNOWN_ERROR';
    throw error;
  }

  return result;
};

export type EventType = {
  id: string;
  userId: string;
  title: string;
  duration: string;
  location: string;
  link: string;
  enabled: boolean;
};

export default function AllAppointments() {
  const query = useQuery({
    queryKey: ["scheduledAppointments"],
    queryFn: () =>
      getAppointmentsRequest(
        dayjs(new Date(new Date().setHours(0, 0, 0, 0))).toDate(),
      ),
  });

  if (!query.data) return null;

  return (
    <div className="flex flex-col gap-3">
      {query.data.sortedAppointments.map((appointment: Appointment) => (
        <div
          key={appointment.id}
          className="rounded-md border border-slate-700 p-2"
        >
          <h2 className="-mt-1 text-lg">
            {truncate(appointment.title!, { length: 20 }) || "No title"}
          </h2>
          <p>
            {format(dayjs(appointment.startsAt).toDate(), "EEEE, d LLLL ")}
            {"  |  "}
            {dayjs(appointment.startsAt).format("hh:mm A")} -{" "}
            {dayjs(appointment.endsAt).format("hh:mm A")}
          </p>
          <p>{appointment.description}</p>
        </div>
      ))}
    </div>
  );
}
