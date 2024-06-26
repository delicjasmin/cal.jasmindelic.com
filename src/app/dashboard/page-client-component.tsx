"use client";

import { Button } from "@/components/ui/button";
import { DateSelect } from "@/components/ui/date-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import dayjs from "dayjs";
import { capitalize, times } from "lodash";
import {
  CalendarPlus2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Day from "./day";
import NewAppointment from "./new-appointment";
import Week from "./week";

function useDateState() {
  const params = useSearchParams();
  const def = dayjs(new Date(new Date().setHours(0, 0, 0, 0)));

  const pMode = params.get("mode");
  const mode = pMode === "day" || pMode === "week" ? pMode : "day";

  const day = params.get("day") ? parseInt(params.get("day")!) : def.date();
  const month = params.get("month")
    ? parseInt(params.get("month")!)
    : def.month() + 1;
  const year = params.get("year") ? parseInt(params.get("year")!) : def.year();

  return [
    {
      mode,
      day,
      month,
      year,
      date: def
        .date(day)
        .month(month - 1)
        .year(year)
        .toDate(),
    },
    (mode: "day" | "week", date: Date) => {
      const asDayjs = dayjs(date);
      const update = new URLSearchParams(params);
      update.set("mode", mode);
      update.set("day", "" + asDayjs.date());
      update.set("month", "" + (asDayjs.month() + 1));
      update.set("year", "" + asDayjs.year());

      window.history.replaceState(null, "", `/dashboard?` + update.toString());
    },
  ] as const;
}

export default function Dashboard() {
  const [{ mode, date }, setDateState] = useDateState();
  const [open, setOpen] = useState(false);
  const [time, setTime] = useState("12:00 AM");
  const router = useRouter();
  const formatStr =
    mode === "day"
      ? format(date, "eee, d LLL")
      : format(dayjs(date).startOf("week").toDate(), "'Week of' d LLL - ") +
        format(dayjs(date).endOf("week").toDate(), "d LLL");

  const changeDate = (str: string) => {
    setDateState(
      mode,
      str === "next"
        ? dayjs(date)
            .add(mode === "day" ? 1 : 7, "day")
            .toDate()
        : dayjs(date)
            .subtract(mode === "day" ? 1 : 7, "day")
            .toDate(),
    );
  };

  const onDateSelect = (date: Date) => {
    setDateState(mode, date);
  };

  useEffect(() => setDateState(mode, date), [mode, date]);

  return (
    <>
      <header className="sticky top-0 z-50 flex w-full items-center bg-white shadow-md">
        <nav className="max-w-8xl mx-auto flex h-16 w-full items-center justify-between border-b-2 p-2 px-20">
          <div className="flex items-center justify-center gap-6">
            <div className="flex items-center gap-10">
              <Button
                onClick={() => {
                  const today = dayjs().startOf("day");
                  setDateState(mode, today.toDate());
                }}
              >
                Today
              </Button>
              <div className="flex gap-2">
                <Button onClick={() => changeDate("previous")}>
                  <ChevronLeft className="w-5" />
                </Button>
                <Button onClick={() => changeDate("next")}>
                  <ChevronRight className="w-5" />
                </Button>
              </div>
              <DateSelect
                onChange={onDateSelect}
                value={date}
                formatStr={formatStr}
              ></DateSelect>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select
              onValueChange={(value: "day" | "week") => {
                setDateState(value, date);
              }}
              value={mode}
            >
              <SelectTrigger className="w-28">
                <SelectValue>{capitalize(mode)}</SelectValue>
                <ChevronDown className="w-5" />
              </SelectTrigger>
              <SelectContent className="w-28">
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="week">Week</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </nav>
      </header>

      <div className="mx-5 flex w-auto">
        <div className="flex w-fit flex-col text-nowrap text-right font-mono text-xs text-gray-500">
          <div className="sticky top-16 -mr-2 h-20 border-b-2 bg-white"></div>
          <div className="-mt-2 h-10"></div>
          {times(12).map((i) => (
            <div key={i + 1} className="h-10 pr-2">
              {i + 1} {i < 11 ? "AM" : "PM"}
            </div>
          ))}
          {times(11).map((i) => (
            <div key={i + 1} className="h-10 pr-2">
              <span>{i + 1} PM</span>
            </div>
          ))}
        </div>

        <div className="mt-20 flex flex-col">
          {times(23).map((i) => (
            <div key={i} className="box-border h-10 border-b px-1"></div>
          ))}
        </div>

        {mode === "day" ? (
          <Day
            date={date}
            mode={mode}
            setDate={setDateState}
            setOpen={setOpen}
            setTime={setTime}
          ></Day>
        ) : (
          <Week
            date={date}
            mode={mode}
            setDate={setDateState}
            setOpen={setOpen}
            setTime={setTime}
          ></Week>
        )}
      </div>

      <NewAppointment
        date={date}
        open={open}
        setOpen={setOpen}
        time={time}
      ></NewAppointment>

      <Button
        className="fixed bottom-10 right-10 size-fit rounded-full p-3.5"
        onClick={() => {
          router.push("/events");
        }}
      >
        <CalendarPlus2 />
      </Button>
    </>
  );
}
