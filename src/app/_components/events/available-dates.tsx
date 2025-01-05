import { Calendar } from "@/components/ui/calendar";
import dayjs from "dayjs";
import { type Dispatch, type SetStateAction, useMemo } from "react";

export default function AvailableDates({
  disabledDays,
  enabledDays,
  selectedDate,
  setSelectedDate,
  setSelectedTime,
}: {
  disabledDays: number[];
  enabledDays: number[];
  selectedDate: Date;
  setSelectedDate: Dispatch<SetStateAction<Date>>;
  setSelectedTime: Dispatch<SetStateAction<number | null>>;
}) {
  return (
    <div className="flex w-full flex-col gap-4 border-b border-black px-5 py-8 lg:w-6/12 lg:border-b-0 lg:border-r">
      <h2 className="font-medium">Select date & time</h2>
      <Calendar
        mode="single"
        selected={selectedDate}
        showOutsideDays={false}
        fromMonth={dayjs().startOf("month").toDate()}
        onSelect={(date) => {
          if (date) {
            setSelectedDate(date);
            setSelectedTime(null);
          }
        }}
        disabled={[{ before: new Date() }, { dayOfWeek: disabledDays }]}
        modifiers={{
          available: { dayOfWeek: enabledDays ?? [] },
        }}
        modifiersClassNames={{
          available: "bg-gray-200 hover:bg-gray-300",
        }}
        classNames={{
          caption: "flex justify-center py-4 relative items-center",
          caption_label: "lg:text-lg xl:text-2xl font-medium lg:font-semibold",
          nav_button:
            "h-8 w-8 lg:h-10 lg:w-10 bg-gray-200 rounded-full hover:bg-gray-300 flex items-center justify-center",
          nav_button_previous: "absolute left-0 lg:left-6",
          nav_button_next: "absolute right-0 lg:right-6",
          head_row: "flex justify-around w-full",
          head_cell:
            "text-sm md:text-base lg:text-lg font-medium text-gray-800",
          row: "flex w-full mt-3 first:justify-end",
          cell: "relative lg:p-0.5 2xl:p-2 text-center text-lg focus-within:relative focus-within:z-20",
          day: "h-8 w-8 xs:h-10 xs:w-10 lg:h-12 lg:w-12 2xl:h-16 2xl:w-16 text-sm md:text-base lg:text-lg font-medium flex items-center justify-center rounded-md border-gray-400 border",
          day_disabled: "text-muted-foreground opacity-50 border-none",
          day_selected:
            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground after:bg-secondary",
          day_today:
            "relative after:content-[''] after:absolute after:bottom-1 lg:after:bottom-2 after:left-1/2 after:h-1 after:w-1 xl:after:h-2 xl:after:w-2 after:rounded-full after:bg-primary after:transform after:-translate-x-1/2",
        }}
        className="max-w-full self-center p-0 md:max-w-4xl"
      />
    </div>
  );
}
