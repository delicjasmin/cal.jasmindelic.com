import dayjs from "dayjs";
import { Appointment } from "./all-appointments";
import AppointmentData from "./appointment-data";

export default function AppointmentGroup({
  date,
  result,
  leftOffset,
  topOffset,
  width,
}: {
  date: Date;
  result: {
    parent: Appointment;
    children: (typeof result)[];
  }[];
  leftOffset: number;
  topOffset: number;
  width: number;
}) {
  const startOfDay = dayjs(date);
  const endOfDay = dayjs(date).endOf("day");

  return (
    <div
      className="absolute w-full"
      style={{
        pointerEvents: "none",
        top: topOffset,
      }}
    >
      {result.map((appointment, i) => (
        <>
          <div
            key={appointment.parent.id}
            className="absolute rounded-sm border border-slate-700 bg-amber-400"
            style={{
              pointerEvents: "auto",
              width: `calc(${width}%/${result.length})`,
              left: `calc(${leftOffset}% + ${i}*${width}%/${result.length})`,
              height:
                40 *
                Math.abs(
                  dayjs(
                    startOfDay.isAfter(appointment.parent.startsAt)
                      ? startOfDay
                      : endOfDay.isBefore(appointment.parent.endsAt)
                        ? endOfDay
                        : appointment.parent.endsAt,
                  ).diff(
                    dayjs(
                      startOfDay.isAfter(appointment.parent.startsAt)
                        ? appointment.parent.endsAt
                        : appointment.parent.startsAt,
                    ),
                    "h",
                    true,
                  ),
                ),
            }}
          >
            <AppointmentData appointment={appointment.parent}></AppointmentData>
          </div>
          {appointment.children.map((res) => (
            <AppointmentGroup
              key={res[0].parent.id}
              date={date}
              result={res}
              leftOffset={leftOffset + 5 + (i * width) / result.length}
              topOffset={
                40 *
                dayjs(res[0].parent.startsAt).diff(
                  appointment.parent.startsAt,
                  "h",
                  true,
                )
              }
              width={width - 5 - (i * width) / result.length}
            ></AppointmentGroup>
          ))}
        </>
      ))}
    </div>
  );
}
