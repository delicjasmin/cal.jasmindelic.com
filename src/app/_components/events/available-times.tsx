import { ScrollArea } from "@/components/ui/scroll-area";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import dayjs from "dayjs";
import { type Dispatch, type SetStateAction, useCallback } from "react";

export default function AvailableTimes({
  availableTimes,
  selectedDate,
  selectedTime,
  setTimeFormat,
  setSelectedTime,
  timeFormat,
}: {
  availableTimes: {
    display12: string;
    display24: string;
    offset: number;
  }[];
  selectedDate: Date;
  selectedTime: number | null;
  setSelectedTime: Dispatch<SetStateAction<number | null>>;
  setTimeFormat: Dispatch<SetStateAction<"12h" | "24h">>;
  timeFormat: "12h" | "24h";
}) {
  const handleTimeClick = useCallback(
    (offset: number) => {
      setSelectedTime(offset);
    },
    [setSelectedTime],
  );

  const handleTimeFormatSwitch = useCallback(
    (value: "12h" | "24h") => {
      if (value) setTimeFormat(value);
    },
    [setTimeFormat],
  );

  return (
    <div className="flex w-full flex-col gap-5 px-5 py-8 lg:w-3/12">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">
          {selectedDate
            ? dayjs(selectedDate).format("MMM DD")
            : "Select a date"}
        </h3>

        <ToggleGroup
          type="single"
          value={timeFormat}
          onValueChange={handleTimeFormatSwitch}
        >
          <ToggleGroupItem value="12h">12h</ToggleGroupItem>
          <ToggleGroupItem value="24h">24h</ToggleGroupItem>
        </ToggleGroup>
      </div>
      {availableTimes.length > 0 ? (
        <ScrollArea className="px-6" type="auto">
          <div className="flex flex-col gap-2">
            {availableTimes.map((time) => (
              <button
                key={time.offset}
                className={`rounded-md border border-gray-400 bg-gray-200 px-4 py-2 hover:bg-gray-300 ${selectedTime === time.offset ? "bg-primary text-white hover:bg-primary hover:opacity-80" : ""}`}
                onClick={() => handleTimeClick(time.offset)}
              >
                {timeFormat === "12h" ? time.display12 : time.display24}
              </button>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <p className="text-gray-500">No available times</p>
      )}
    </div>
  );
}
