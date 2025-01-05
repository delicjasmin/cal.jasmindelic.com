"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TimeSelect from "@/components/ui/time-select";
import { TimezoneSelect } from "@/components/ui/timezone-select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CalendarPlus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ListCollapse,
  MoveLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

export const daysOfWeek = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

const daySchema = z.object({
  enabled: z.boolean(),
  startTime: z.string(),
  endTime: z.string(),
  day: z.string(),
});

export const formSchema = z.object({
  title: z.string(),
  duration: z.string(),
  location: z.string(),
  timezone: z.string(),
  link: z.string(),
  monday: daySchema,
  tuesday: daySchema,
  wednesday: daySchema,
  thursday: daySchema,
  friday: daySchema,
  saturday: daySchema,
  sunday: daySchema,
});

type DaySchema = z.infer<typeof daySchema>;
export type FormSchema = z.infer<typeof formSchema>;

const newEventRequest = async (data: {
  title: string;
  duration: string;
  location: string;
  timezone: string;
  link: string;
  monday: DaySchema;
  tuesday: DaySchema;
  wednesday: DaySchema;
  thursday: DaySchema;
  friday: DaySchema;
  saturday: DaySchema;
  sunday: DaySchema;
}) => {
  const reqParams = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };

  const res = await fetch("/api/events", reqParams);

  const result = await res.json();
  if (result.error) {
    const error = new Error(result.error.message || "Unkown error");
    // error.code = result.error.code || 'UNKNOWN_ERROR';
    throw error;
  }

  return result;
};

export default function NewEvent({ email }: { email: string | null }) {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      duration: "",
      location: "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      link: "",
      monday: {
        enabled: true,
        startTime: "480",
        endTime: "960",
        day: "monday",
      },
      tuesday: {
        enabled: true,
        startTime: "480",
        endTime: "960",
        day: "tuesday",
      },
      wednesday: {
        enabled: true,
        startTime: "480",
        endTime: "960",
        day: "wednesday",
      },
      thursday: {
        enabled: true,
        startTime: "480",
        endTime: "960",
        day: "thursday",
      },
      friday: {
        enabled: true,
        startTime: "480",
        endTime: "960",
        day: "friday",
      },
      saturday: {
        enabled: false,
        startTime: "480",
        endTime: "960",
        day: "saturday",
      },
      sunday: {
        enabled: false,
        startTime: "480",
        endTime: "960",
        day: "sunday",
      },
    },
  });
  const router = useRouter();
  const queryClient = useQueryClient();

  const createEvent = useMutation({
    mutationFn: newEventRequest,
  });

  const onCreateEvent: SubmitHandler<FormSchema> = (data) => {
    createEvent
      .mutateAsync(data)
      .then(() => form.reset())
      .then(() => queryClient.invalidateQueries({ queryKey: ["events"] }))
      .then(() => router.push("/events"))
      .catch(console.warn);
  };

  return (
    <div className="m-auto flex max-w-[1920px] items-center">
      <div className="flex h-[100vh] max-h-[865px] w-2/5 flex-col border-r border-black">
        <div className="flex flex-col gap-2 border-b border-black p-6">
          <MoveLeft
            onClick={() => router.push("/events")}
            className="h-6 w-8 cursor-pointer"
          />
          <h1 className="text-lg font-semibold">New Event Type</h1>
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onCreateEvent)}
            className="mx-12 my-8 flex grow flex-col gap-2"
          >
            <Tabs defaultValue="details">
              <TabsList>
                <TabsTrigger value="details" className="gap-2">
                  <ListCollapse className="size-5" /> Details
                </TabsTrigger>
                <TabsTrigger value="availability" className="gap-2">
                  <CalendarPlus className="size-5" /> Availability
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="w-full py-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="pl-5 data-[placeholder]:text-muted-foreground">
                            <SelectValue placeholder="Choose event duration" />
                            <ChevronDown className="w-5" />
                          </SelectTrigger>
                        </FormControl>

                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="45">45 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="90">1.5 hours</SelectItem>
                          <SelectItem value="120">2 hours</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Location" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="timezone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timezone</FormLabel>
                      <FormControl>
                        <TimezoneSelect
                          onValueChange={field.onChange}
                          value={field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="link"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Link" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <TabsList className="mt-5 w-full items-center justify-end border-b-0">
                  <TabsTrigger
                    value="availability"
                    className="h-9 w-28 border shadow-md"
                  >
                    Next
                    <ChevronRight className="w-5" />
                  </TabsTrigger>
                </TabsList>
              </TabsContent>

              <TabsContent value="availability" className="py-6">
                <div className="flex flex-col justify-center gap-3">
                  {daysOfWeek.map((day) => {
                    return (
                      <FormField
                        key={day}
                        control={form.control}
                        name={day}
                        render={() => (
                          <FormItem>
                            <FormControl>
                              <TimeSelect day={day} form={form}></TimeSelect>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    );
                  })}
                </div>

                <TabsList className="mt-5 flex items-center justify-between border-b-0">
                  <TabsTrigger
                    value="details"
                    className="h-9 w-28 border shadow-md"
                  >
                    <ChevronLeft className="w-5" />
                    Previous
                  </TabsTrigger>
                  <Button className="h-9 w-28" type="submit">
                    Submit
                  </Button>
                </TabsList>
              </TabsContent>
            </Tabs>
          </form>
        </Form>
      </div>
      <div className="mx-auto flex flex-col rounded-lg border border-black">
        <div className="w-full border-b border-black">
          <p className="p-2 text-sm">This is your event preview</p>
        </div>
        <div className="flex">
          <div className="max-w-60 space-y-1 border-r border-black px-5 py-8">
            <p className="text-sm">{email}</p>
            <h1 className="text-xl font-semibold">
              {form.watch("title") || "Your event title"}
            </h1>
            <p className="text-sm font-light ">
              {form.watch("location") || "(location)"}
            </p>
            <p className="text-sm font-light ">
              {form.watch("duration")
                ? form.watch("duration") + " minutes"
                : "(duration)"}
            </p>
          </div>
          <div className="flex w-96 max-w-80 flex-col space-y-1 px-5 py-8">
            <h2 className="font-medium">Select date & time</h2>
            <Calendar
              className="self-center"
              classNames={{ row: "flex " }}
            ></Calendar>
            {/* <TimezoneSelect /> */}
          </div>
        </div>
      </div>
    </div>
  );
}
