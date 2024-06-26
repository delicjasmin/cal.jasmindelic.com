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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { ChevronDown, MoveLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  title: z.string(),
  duration: z.string(),
  location: z.string(),
  link: z.string(),
});

type FormSchema = z.infer<typeof formSchema>;

const listTimes = () => {
  const timeArray = [];

  const date = dayjs(new Date(new Date().setHours(0, 0, 0, 0)));

  timeArray.push(dayjs(date).format("hh:mm A"));
  console.log(timeArray);
};
listTimes();
const newEventRequest = async (data: {
  title: string;
  duration: string;
  location: string;
  link: string;
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
      link: "",
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
    <div className="m-auto flex max-w-[1366px] items-center">
      <div className="flex w-2/5 flex-col border-r border-black">
        <div className="flex flex-col gap-2 border-b border-black p-6">
          <MoveLeft
            onClick={() => router.push("/events")}
            className="h-6 w-8 hover:cursor-pointer"
          />
          <h1 className="text-lg font-semibold">New Event Type</h1>
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onCreateEvent)}
            className="mx-12 my-8 flex grow flex-col gap-2"
          >
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
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="pl-5 data-[placeholder]:text-muted-foreground">
                        <SelectValue placeholder="Choose event duration" />
                        <ChevronDown className="w-5" />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent onCloseAutoFocus={(e) => e.preventDefault()}>
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

            <Button className="mt-5 place-self-end" type="submit">
              Submit
            </Button>
          </form>
        </Form>
      </div>
      <div className="mx-auto flex h-fit flex-col items-center justify-center overflow-hidden rounded-sm border border-black">
        <div className="w-full border-b border-black">
          <p className="p-2 text-sm">This is your event preview</p>
        </div>
        <div className="flex h-full">
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
          <div className="flex min-h-fit w-[500px] max-w-80 flex-col space-y-1 px-2 py-8">
            <h2 className="font-medium">Select date & time</h2>
            <Calendar
              className="self-center"
              classNames={{ row: "flex " }}
            ></Calendar>
            <Select>
              <SelectTrigger className="">
                <SelectValue placeholder="Select a timezone" />
                <ChevronDown className="w-5" />
              </SelectTrigger>
              <SelectContent onCloseAutoFocus={(e) => e.preventDefault()}>
                <SelectGroup>
                  <SelectLabel>North America</SelectLabel>
                  <SelectItem value="est">
                    Eastern Standard Time (EST)
                  </SelectItem>
                  <SelectItem value="cst">
                    Central Standard Time (CST)
                  </SelectItem>
                  <SelectItem value="mst">
                    Mountain Standard Time (MST)
                  </SelectItem>
                  <SelectItem value="pst">
                    Pacific Standard Time (PST)
                  </SelectItem>
                  <SelectItem value="akst">
                    Alaska Standard Time (AKST)
                  </SelectItem>
                  <SelectItem value="hst">
                    Hawaii Standard Time (HST)
                  </SelectItem>
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>Europe & Africa</SelectLabel>
                  <SelectItem value="gmt">Greenwich Mean Time (GMT)</SelectItem>
                  <SelectItem value="cet">
                    Central European Time (CET)
                  </SelectItem>
                  <SelectItem value="eet">
                    Eastern European Time (EET)
                  </SelectItem>
                  <SelectItem value="west">
                    Western European Summer Time (WEST)
                  </SelectItem>
                  <SelectItem value="cat">Central Africa Time (CAT)</SelectItem>
                  <SelectItem value="eat">East Africa Time (EAT)</SelectItem>
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>Asia</SelectLabel>
                  <SelectItem value="msk">Moscow Time (MSK)</SelectItem>
                  <SelectItem value="ist">India Standard Time (IST)</SelectItem>
                  <SelectItem value="cst_china">
                    China Standard Time (CST)
                  </SelectItem>
                  <SelectItem value="jst">Japan Standard Time (JST)</SelectItem>
                  <SelectItem value="kst">Korea Standard Time (KST)</SelectItem>
                  <SelectItem value="ist_indonesia">
                    Indonesia Central Standard Time (WITA)
                  </SelectItem>
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>Australia & Pacific</SelectLabel>
                  <SelectItem value="awst">
                    Australian Western Standard Time (AWST)
                  </SelectItem>
                  <SelectItem value="acst">
                    Australian Central Standard Time (ACST)
                  </SelectItem>
                  <SelectItem value="aest">
                    Australian Eastern Standard Time (AEST)
                  </SelectItem>
                  <SelectItem value="nzst">
                    New Zealand Standard Time (NZST)
                  </SelectItem>
                  <SelectItem value="fjt">Fiji Time (FJT)</SelectItem>
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>South America</SelectLabel>
                  <SelectItem value="art">Argentina Time (ART)</SelectItem>
                  <SelectItem value="bot">Bolivia Time (BOT)</SelectItem>
                  <SelectItem value="brt">Brasilia Time (BRT)</SelectItem>
                  <SelectItem value="clt">Chile Standard Time (CLT)</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
