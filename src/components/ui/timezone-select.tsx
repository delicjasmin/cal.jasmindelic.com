import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type TimezoneSelectProps = {
  value: string;
  onValueChange: (value: string) => void;
};

export function TimezoneSelect({
  value,
  onValueChange: onValueChange,
}: TimezoneSelectProps) {
  const [detectedTimezone] = useState<string>(value);

  const timezoneGroups = useMemo(
    () => [
      {
        label: "Auto-detect",
        items: detectedTimezone
          ? [
              {
                value: detectedTimezone,
                label: `Auto-detected (${detectedTimezone})`,
              },
            ]
          : [],
      },
      {
        label: "North America",
        items: [
          { value: "America/New_York", label: "Eastern Standard Time (EST)" },
          { value: "America/Chicago", label: "Central Standard Time (CST)" },
          { value: "America/Denver", label: "Mountain Standard Time (MST)" },
          {
            value: "America/Los_Angeles",
            label: "Pacific Standard Time (PST)",
          },
          { value: "America/Anchorage", label: "Alaska Standard Time (AKST)" },
          { value: "Pacific/Honolulu", label: "Hawaii Standard Time (HST)" },
        ],
      },
      {
        label: "Europe & Africa",
        items: [
          { value: "Etc/GMT", label: "Greenwich Mean Time (GMT)" },
          { value: "Europe/Berlin", label: "Central European Time (CET)" },
          { value: "Europe/Kiev", label: "Eastern European Time (EET)" },
          {
            value: "Europe/London",
            label: "Western European Summer Time (WEST)",
          },
          { value: "Africa/Harare", label: "Central Africa Time (CAT)" },
          { value: "Africa/Nairobi", label: "East Africa Time (EAT)" },
        ],
      },
      {
        label: "Asia",
        items: [
          { value: "Europe/Moscow", label: "Moscow Time (MSK)" },
          { value: "Asia/Kolkata", label: "India Standard Time (IST)" },
          { value: "Asia/Shanghai", label: "China Standard Time (CST)" },
          { value: "Asia/Tokyo", label: "Japan Standard Time (JST)" },
          { value: "Asia/Seoul", label: "Korea Standard Time (KST)" },
          {
            value: "Asia/Makassar",
            label: "Indonesia Central Standard Time (WITA)",
          },
        ],
      },
      {
        label: "Australia & Pacific",
        items: [
          {
            value: "Australia/Perth",
            label: "Australian Western Standard Time (AWST)",
          },
          {
            value: "Australia/Darwin",
            label: "Australian Central Standard Time (ACST)",
          },
          {
            value: "Australia/Sydney",
            label: "Australian Eastern Standard Time (AEST)",
          },
          {
            value: "Pacific/Auckland",
            label: "New Zealand Standard Time (NZST)",
          },
          { value: "Pacific/Fiji", label: "Fiji Time (FJT)" },
        ],
      },
      {
        label: "South America",
        items: [
          {
            value: "America/Argentina/Buenos_Aires",
            label: "Argentina Time (ART)",
          },
          { value: "America/La_Paz", label: "Bolivia Time (BOT)" },
          { value: "America/Sao_Paulo", label: "Brasilia Time (BRT)" },
          { value: "America/Santiago", label: "Chile Standard Time (CLT)" },
        ],
      },
    ],
    [detectedTimezone],
  );

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a timezone" />
        <ChevronDown className="w-5" />
      </SelectTrigger>
      <SelectContent>
        {timezoneGroups.map((group) => (
          <SelectGroup key={group.label}>
            <SelectLabel>{group.label}</SelectLabel>
            {group.items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}
