"use client";

import * as React from "react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DateSelect({
  formatStr,
  onChange,
  value,
}: {
  formatStr: string;
  onChange: (...event: any[]) => void;
  value: Date;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "box-border h-9 w-fit rounded-b-none border-x-0 border-b-2 border-t-0 border-gray-600 px-3 font-normal",
            !value && "text-muted-foreground",
          )}
        >
          {value ? formatStr : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          defaultMonth={value}
          selected={value}
          onSelect={onChange}
          initialFocus
          required
        />
      </PopoverContent>
    </Popover>
  );
}
