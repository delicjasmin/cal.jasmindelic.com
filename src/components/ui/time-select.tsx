import { type FormSchema } from "@/app/events/new/page-client-component";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";
import { Switch } from "./switch";

type Day =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

const listTimes = (hour: number = 0, minute: number = 0) => {
  const timeArray = [];
  let minutes = 0;

  for (let h = hour; h < 24; h++) {
    for (let m = minute; m < 60; m += 15) {
      const period = h < 12 ? "AM" : "PM";
      const time = `${h === 0 ? "12" : h < 10 ? "0" + h : h > 12 && h < 22 ? "0" + (h - 12) : h >= 22 ? h - 12 : h}:${m === 0 ? "00" : m} ${period}`;
      timeArray.push({
        time,
        minutes: minutes.toString(),
      });
      minutes += 15;
    }
  }
  return timeArray;
};
const times = listTimes();

const timeIndex = (time: string, timesArray: typeof times) =>
  timesArray.findIndex((i) => i.minutes === time);
const restOfTimes = (index: number) => times.slice(index);

export default function TimeSelect({
  day,
  form,
}: {
  day: Day;
  form: UseFormReturn<FormSchema, any, undefined>;
}) {
  const currentStartTime = form.watch(`${day}.startTime`);
  const startTimeIndex = timeIndex(currentStartTime, times);

  return (
    <div className="flex items-center gap-2">
      <FormField
        control={form.control}
        name={`${day}.enabled`}
        render={({ field }) => (
          <FormItem className="flex w-36 items-center gap-4 space-y-0">
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <FormLabel>{day.charAt(0).toUpperCase() + day.slice(1)}</FormLabel>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`${day}.startTime`}
        render={({ field }) => (
          <FormItem>
            <Select
              disabled={!form.watch(`${day}.enabled`)}
              onValueChange={field.onChange}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger className="flex w-24 justify-center rounded-md border-gray-600 hover:bg-accent">
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="h-48">
                {times.map((i) => (
                  <SelectItem key={i.time} value={i.minutes}>
                    {i.time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <div>-</div>
      <FormField
        control={form.control}
        name={`${day}.endTime`}
        render={({ field }) => (
          <FormItem>
            <Select
              disabled={!form.watch(`${day}.enabled`)}
              onValueChange={field.onChange}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger className="flex w-24 justify-center rounded-md border-gray-600 hover:bg-accent">
                  <SelectValue>
                    {times.find((t) => t.minutes === field.value)?.time}
                  </SelectValue>
                </SelectTrigger>
              </FormControl>
              <SelectContent className="h-48">
                {restOfTimes(startTimeIndex).map((i) => (
                  <SelectItem key={i.time} value={i.minutes}>
                    {i.time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
