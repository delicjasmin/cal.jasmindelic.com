import { useQuery } from "@tanstack/react-query";
import Event from "./event";

const getEventsRequest = async () => {
  const res = await fetch("/api/events");

  const result = await res.json();
  if (result.error) {
    const error = new Error(result.error.message || "Unkown error");
    // error.code = result.error.code || 'UNKNOWN_ERROR';
    throw error;
  }

  return result;
};

export type EventType = {
  id: string;
  userId: string;
  title: string;
  duration: string;
  location: string;
  link: string;
  enabled: boolean;
};

export default function AllEvents() {
  const query = useQuery({
    queryKey: ["events"],
    queryFn: getEventsRequest,
  });

  if (!query.data || !query.data.result) return null;

  return (
    <div className="flex flex-wrap gap-4">
      {query.data.result.map((event: EventType) => (
        <Event key={event.id} event={event}></Event>
      ))}
    </div>
  );
}
