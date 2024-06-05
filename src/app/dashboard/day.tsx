import { format } from "date-fns";
import { times } from "lodash";
import { Dispatch, SetStateAction } from "react";
import AllAppointments from "./all-appointments";

export default function Day({
  date,
  mode,
  setDate,
  setOpen,
  setTime,
}: {
  date: Date;
  mode: "day" | "week";
  setDate: (mode: "day" | "week", date: Date) => void;
  setOpen: Dispatch<SetStateAction<boolean>>;
  setTime: Dispatch<SetStateAction<string>>;
}) {
  const onClick = (time: string) => {
    setDate(mode, date);
    setTime(time);
    setOpen(true);
  };

  return (
    <div className="relative flex w-full flex-col border-l-2">
      <div className="sticky top-16 z-10 flex h-20 items-end border-b-2 bg-white p-4">
        {mode === "day" ? (
          format(date, "EEEE, do")
        ) : (
          <a
            className="cursor-pointer rounded-full bg-gray-300 px-4 py-1"
            onClick={() => {
              setDate("day", date);
            }}
          >
            {format(date, "E, do")}
          </a>
        )}
      </div>

      {times(13).map((i) => (
        <div
          className="box-border flex h-10 w-full flex-col border-b px-1"
          key={i}
        >
          <div
            className="flex h-1/2 w-full"
            onClick={() =>
              onClick(
                (i === 0 ? 12 : i < 10 ? "0" + i : i) +
                  ":00 " +
                  (i < 12 ? "AM" : "PM"),
              )
            }
          ></div>
          <div
            className="flex h-1/2 w-full"
            onClick={() =>
              onClick(
                (i === 0 ? 12 : i < 10 ? "0" + i : i) +
                  ":30 " +
                  (i < 12 ? "AM" : "PM"),
              )
            }
          ></div>
        </div>
      ))}

      {times(11).map((i) => (
        <div
          key={i + 1}
          className="box-border flex h-10 w-full flex-col border-b px-1"
        >
          <div
            className="h-1/2 w-full"
            onClick={() => onClick((i < 9 ? "0" + ++i : i + 1) + ":00 PM")}
          ></div>
          <div
            className="h-1/2 w-full"
            onClick={() => onClick((i < 9 ? "0" + ++i : i + 1) + ":30 PM")}
          ></div>
        </div>
      ))}

      <AllAppointments date={date}></AllAppointments>
    </div>
  );
}
