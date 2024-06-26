import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ClipboardCopy, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { EventType } from "./all-events";

const deleteEventRequest = async (data: { id: string }) => {
  const reqParams = {
    method: "DELETE",
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

const enableEventRequest = async (data: { enabled: boolean; id: string }) => {
  const reqParams = {
    method: "PATCH",
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

export default function Event({ event }: { event: EventType }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const deleteEvent = useMutation({
    mutationFn: deleteEventRequest,
  });

  const onEventDelete = () => {
    deleteEvent
      .mutateAsync({ id: event.id })
      .then(() => queryClient.invalidateQueries({ queryKey: ["events"] }))
      .catch(console.warn);
  };

  const enableEvent = useMutation({
    mutationFn: enableEventRequest,
  });

  const onEventSwitch = () => {
    enableEvent
      .mutateAsync({ enabled: !event.enabled, id: event.id })
      .then(() => queryClient.invalidateQueries({ queryKey: ["events"] }))
      .catch(console.warn);
  };

  return (
    <Card className="relative min-w-72 max-w-96 basis-1/3">
      <div className="absolute right-3 top-3 flex gap-3">
        <Pencil
          className="w-4 cursor-pointer"
          onClick={() => router.push("/events/edit/" + event.id)}
        />
        <Trash2
          className="w-4 cursor-pointer"
          onClick={() => onEventDelete()}
        />
      </div>
      <CardHeader>
        <CardTitle>{event.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{event.duration} minutes</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={() => navigator.clipboard.writeText(event.link)}>
          Copy link
          <ClipboardCopy className="w-5" />
        </Button>
        <Switch checked={event.enabled} onCheckedChange={onEventSwitch} />
      </CardFooter>
    </Card>
  );
}
