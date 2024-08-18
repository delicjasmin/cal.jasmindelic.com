"use client";

import AsyncCreatableSelect from "@/components/ui/async-creatable-select";
import { Button } from "@/components/ui/button";
import { DateSelect } from "@/components/ui/date-select";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ContactsContext,
  ContactsProvider,
} from "@/providers/ContactsContextProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import dayjs from "dayjs";
import { ClockIcon, MapPinIcon, TextIcon, UsersIcon } from "lucide-react";
import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

const validationSchema = z.object({
  description: z.string(),
  endDate: z.date(),
  endTime: z.string(),
  location: z.string(),
  participantsArray: z.array(z.string()),
  startDate: z.date(),
  startTime: z.string(),
  title: z.string(),
});

type ValidationSchema = z.infer<typeof validationSchema>;

const listTimes = (hour: number = 0, minute: number = 0) => {
  const timeArray = [];

  for (let h = hour; h < 24; h++) {
    for (let m = minute; m < 60; m += 15) {
      const period = h < 12 ? "AM" : "PM";
      const time = `${h === 0 ? "12" : h < 10 ? "0" + h : h > 12 && h < 22 ? "0" + (h - 12) : h >= 22 ? h - 12 : h}:${m === 0 ? "00" : m} ${period}`;
      timeArray.push({
        time,
        hours: h,
        minutes: m,
      });
    }
  }
  return timeArray;
};
const times = listTimes();
const timeIndex = (time: string, timesArray: typeof times) =>
  timesArray.findIndex((i) => i.time === time);
const extendTimes = (index: number) =>
  times.slice(index).concat(times.slice(0, index));

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

function AppointmentDialog({
  date,
  open,
  setOpen,
  defaultTime,
}: {
  date: Date;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  defaultTime: string;
}) {
  const { contacts } = useContext(ContactsContext)!;

  const extendedTimesDefault = extendTimes(timeIndex(defaultTime, times));

  const form = useForm<ValidationSchema>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      title: "",
      startDate: date,
      endDate: date,
      startTime: defaultTime,
      endTime: extendedTimesDefault[4].time,
      location: "",
      participantsArray: [],
      description: "",
    },
  });
  const queryClient = useQueryClient();

  const currentStartTime = form.watch("startTime");
  const startTimeIndex = timeIndex(currentStartTime, times);
  const extendedTimes = useMemo(
    () => extendTimes(timeIndex(currentStartTime, times)),
    [currentStartTime],
  );

  const currentEndTime = form.watch("endTime");
  const endTimeIndex = timeIndex(currentEndTime, extendedTimes);

  const nextDay =
    extendedTimes[0].time === "12:00 AM"
      ? false
      : timeIndex(currentEndTime, extendedTimes) >=
          timeIndex("12:00 AM", extendedTimes)
        ? true
        : false;

  const currentStartDate = form.watch("startDate");

  useEffect(() => {
    if (!nextDay) form.setValue("endDate", currentStartDate);
    else
      form.setValue("endDate", dayjs(currentStartDate).add(1, "day").toDate());
  }, [currentStartDate, form, nextDay]);

  useEffect(() => {
    form.setValue("startTime", defaultTime);
    const extendedTimesDefault = extendTimes(timeIndex(defaultTime, times));
    form.setValue("endTime", extendedTimesDefault[4].time);
  }, [defaultTime, form, open]);

  useEffect(() => {
    form.setValue("startDate", date);
    form.setValue("endDate", date);
  }, [date, form, open]);

  useEffect(() => {
    form.setValue("endTime", extendedTimes[4].time);
  }, [currentStartTime, extendedTimes, form]);

  const createAppointment = useMutation({
    mutationFn: newAppointmentRequest,
  });

  const onCreateAppointment: SubmitHandler<ValidationSchema> = (data) => {
    const startsAt = dayjs(data.startDate)
      .add(times[startTimeIndex].hours, "hours")
      .add(times[startTimeIndex].minutes, "minutes")
      .toDate();
    const endsAt = dayjs(data.endDate)
      .add(extendedTimes[endTimeIndex].hours, "hours")
      .add(extendedTimes[endTimeIndex].minutes, "minutes")
      .toDate();

    const { description, location, participantsArray, title } = data;
    const requestData = {
      contactsArray: contacts,
      description,
      endsAt,
      location,
      participantsArray,
      startsAt,
      title: title,
    };
    createAppointment
      .mutateAsync(requestData)
      .then(() => setOpen(false))
      .then(() => form.reset())
      .then(() => queryClient.invalidateQueries({ queryKey: ["appointments"] }))
      .catch(console.warn);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onCreateAppointment)}
            className="mt-3 space-y-6 rounded-xl border-2 p-6"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="pl-9">
                  <FormControl>
                    <Input placeholder="Add title" {...field}></Input>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center gap-4 text-sm">
              <ClockIcon className="w-5" />
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <DateSelect
                        formatStr={format(field.value, "eee, d LLL")}
                        onChange={field.onChange}
                        value={field.value}
                      ></DateSelect>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center gap-1.5">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="rounded-b-none border-x-0 border-b-2 border-t-0 border-gray-600 hover:bg-accent ">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent
                          className="h-48"
                          onCloseAutoFocus={(e) => e.preventDefault()}
                        >
                          {times.map((i) => (
                            <SelectItem key={i.time} value={i.time}>
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
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="rounded-b-none border-x-0 border-b-2 border-t-0 border-gray-600 hover:bg-accent">
                            <SelectValue>
                              {times.find((t) => t.time === field.value)?.time}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent
                          className="h-48"
                          onCloseAutoFocus={(e) => e.preventDefault()}
                        >
                          {extendTimes(startTimeIndex).map((i) => (
                            <SelectItem key={i.time} value={i.time}>
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

              {nextDay ? (
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <DateSelect
                          formatStr={format(field.value, "eee, d LLL")}
                          onChange={field.onChange}
                          value={field.value}
                        ></DateSelect>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : null}
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex items-center gap-4">
                      <MapPinIcon className="w-5" />
                      <Input placeholder="Add location" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="participantsArray"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex items-center gap-4">
                      <UsersIcon className="w-5" />
                      <AsyncCreatableSelect
                        placeholder="Add participants"
                        onChange={field.onChange}
                        value={field.value}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex items-center gap-4">
                      <TextIcon className="w-5" />
                      <Input placeholder="Add description" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              className="w-full"
              type="submit"
              disabled={createAppointment.isPending}
            >
              Submit
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function NewAppointment({
  date,
  open,
  setOpen,
  time,
}: {
  date: Date;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  time: string;
}) {
  return (
    <ContactsProvider>
      <AppointmentDialog
        date={date}
        open={open}
        setOpen={setOpen}
        defaultTime={time}
      ></AppointmentDialog>
    </ContactsProvider>
  );
}
