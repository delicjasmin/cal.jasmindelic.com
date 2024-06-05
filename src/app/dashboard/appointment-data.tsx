import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import dayjs from "dayjs";
import { Appointment } from "./all-appointments";
import { format } from "date-fns";
import { Pencil, Trash2, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { truncate } from "lodash";
import EditAppointment from "./edit-appointment";
import { useState } from "react";

const deleteAppointmentRequest = async (id: string) => {
  const reqParams = {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
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

export default function AppointmentData({
  appointment,
}: {
  appointment: Appointment;
}) {
  const [counter, setCounter] = useState(0);
  const [open, setOpen] = useState(false);

  const queryClient = useQueryClient();

  const deleteAppointment = useMutation({
    mutationFn: deleteAppointmentRequest,
  });

  const onClickDelete = (id: string) => {
    deleteAppointment
      .mutateAsync(id)
      .then(() => setCounter(() => counter + 1))
      .then(() => queryClient.invalidateQueries({ queryKey: ["appointments"] }))
      .catch(console.warn);
  };

  return (
    <>
      <Popover>
        <PopoverTrigger className="flex h-full w-full flex-col p-1 text-xs font-medium">
          <p>{appointment.title || "No title"}</p>
          <p>
            {dayjs(appointment.startsAt).format("hh:mm A")} -{" "}
            {dayjs(appointment.endsAt).format("hh:mm A")}
          </p>
        </PopoverTrigger>
        <PopoverContent className="text-xs">
          <div className="flex justify-end gap-4">
            <Pencil
              className="w-4 cursor-pointer"
              onClick={() => setOpen(true)}
            />
            <Trash2
              className="w-4 cursor-pointer"
              onClick={() => onClickDelete(appointment.id)}
            />
            <PopoverClose>
              <X className="w-4 cursor-pointer" />
            </PopoverClose>
          </div>
          <h2 className="-mt-1 text-lg">
            {truncate(appointment.title!, { length: 20 }) || "No title"}
          </h2>
          <p>
            {format(dayjs(appointment.startsAt).toDate(), "EEEE, d LLLL ")}
            {"  |  "}
            {dayjs(appointment.startsAt).format("hh:mm A")} -{" "}
            {dayjs(appointment.endsAt).format("hh:mm A")}
          </p>
          <p>{appointment.description}</p>
        </PopoverContent>
      </Popover>

      {open ? (
        <EditAppointment
          key={counter}
          onSuccess={() => setCounter(counter + 1)}
          appointment={appointment}
          open={open}
          setOpen={setOpen}
        ></EditAppointment>
      ) : null}
    </>
  );
}
