import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import AppointmentGroup from "./appointment-group";

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

export type Appointment = {
  participants: {
    id: string | null;
    appointmentId: string | null;
    email: string | null;
  }[];
  title: string | null;
  id: string;
  description: string | null;
  userId: string | null;
  startsAt: Date | null;
  endsAt: Date | null;
  location: string | null;
};

export default function AllAppointments({ date }: { date: Date }) {
  const query = useQuery({
    queryKey: ["appointments", date],
    queryFn: () => getAppointmentsRequest(date),
  });

  if (!query.data) return null;

  type AppointmentGroup = {
    parent: Appointment;
    children: AppointmentGroup;
  }[];
  type NestedAppointmentGroups = {
    parent: Appointment;
    children: AppointmentGroup[] | NestedAppointmentGroups;
  }[][];

  const joinParentsAndChildren = (parent: Appointment) => {
    const groupedAppointment: {
      parent: Appointment;
      children: AppointmentGroup;
    } = { parent, children: [] };

    for (const app of query.data.sortedAppointments) {
      if (
        dayjs(app.startsAt).isAfter(parent.startsAt) &&
        dayjs(app.startsAt).isBefore(parent.endsAt) &&
        !childrenId.includes(app.id)
      ) {
        childrenId.push(app.id);
        const child = joinParentsAndChildren(app);
        groupedAppointment.children.push(child);
      }
    }
    return groupedAppointment;
  };

  const childrenId: string[] = [];
  const parentsWithChildren: AppointmentGroup = [];

  for (let appointment of query.data.sortedAppointments) {
    if (childrenId.includes(appointment.id)) continue;
    parentsWithChildren.push(joinParentsAndChildren(appointment));
  }

  const groupByStartTime = (childrenArray: AppointmentGroup) => {
    const timestamps: Date[] = [];
    const result: AppointmentGroup[] = [];

    for (const app of childrenArray)
      if (app.parent.startsAt && !timestamps.includes(app.parent.startsAt))
        timestamps.push(app.parent.startsAt);

    for (const ts of timestamps)
      result.push(
        childrenArray.filter((app) => app.parent.startsAt === ts).reverse(),
      );

    return result;
  };

  const joinParentsWithGroupedChildren = (childrenArray: AppointmentGroup) => {
    const timestamps: Date[] = [];
    const tempGroup: {
      parent: Appointment;
      children: AppointmentGroup[] | NestedAppointmentGroups;
    }[] = [];
    const result: NestedAppointmentGroups = [];

    for (const app of childrenArray) {
      const grouped = joinParentsWithGroupedChildren(app.children);
      tempGroup.push({
        parent: app.parent,
        children:
          grouped.length === 0 ? groupByStartTime(app.children) : grouped,
      });

      if (app.parent.startsAt && !timestamps.includes(app.parent.startsAt))
        timestamps.push(app.parent.startsAt);
    }

    for (const ts of timestamps)
      result.push(
        tempGroup.filter((app) => app.parent.startsAt === ts).reverse(),
      );

    return result;
  };

  const results = joinParentsWithGroupedChildren(parentsWithChildren);

  return (
    <div>
      {results.map((result) => (
        <AppointmentGroup
          key={result[0].parent.id}
          date={date}
          result={result}
          leftOffset={5}
          topOffset={
            80 + 40 * dayjs(result[0].parent.startsAt).diff(date, "h", true)
          }
          width={90}
        ></AppointmentGroup>
      ))}
    </div>
  );
}
