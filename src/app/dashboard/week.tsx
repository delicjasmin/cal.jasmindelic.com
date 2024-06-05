import dayjs from "dayjs";
import { times } from "lodash";
import { Dispatch, SetStateAction } from "react";
import Day from "./day";

export default function Week({
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
  const week = dayjs(date).startOf("week");

  return (
    <div className="flex w-full">
      {times(7).map((d) => (
        <div key={d} className="border-l-1 flex w-full flex-col">
          <Day
            date={dayjs(week).add(d, "day").toDate()}
            mode={mode}
            setDate={setDate}
            setOpen={setOpen}
            setTime={setTime}
          ></Day>
        </div>
      ))}
    </div>
  );
}
