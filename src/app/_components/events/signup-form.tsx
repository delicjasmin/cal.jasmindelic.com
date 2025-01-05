import { CircleUserRound, MapPin, Timer } from "lucide-react";
import { TimezoneSelect } from "@/components/ui/timezone-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function SignupForm({
  description,
  duration,
  email,
  location,
  onCreateAppointment,
  setEmail,
  setTimezone,
  timezone,
  title,
  username,
}: {
  description: string;
  duration: string;
  email: string;
  location: string;
  onCreateAppointment: () => void;
  setEmail: (email: string) => void;
  setTimezone: (timezone: string) => void;
  timezone: string;
  title: string;
  username: string | null;
}) {
  return (
    <div className="flex w-full flex-col border-b border-black px-5 py-8 lg:w-3/12 lg:border-b-0 lg:border-r">
      <div className="flex flex-col justify-between py-10">
        <span className="flex items-center gap-2">
          <CircleUserRound strokeWidth={1} />
          <p className="lg:text-lg xl:text-xl">{username ?? "Mali Meho"}</p>
        </span>

        <h2 className="tex-lg font-semibold md:text-2xl lg:text-2xl xl:text-3xl">
          {title}
        </h2>
        <p className="text-sm font-light md:text-base xl:text-lg">
          {description}
        </p>

        <span className="mt-4 flex items-center gap-2">
          <MapPin size={20} />
          <p className="text-sm font-light md:text-base">{location}</p>
        </span>
        <span className="flex items-center gap-2">
          <Timer size={20} />
          <p className="text-sm font-light md:text-base">{duration} minutes</p>
        </span>
      </div>

      <div className="flex flex-col gap-10">
        <TimezoneSelect onValueChange={setTimezone} value={timezone} />

        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email address*</Label>
          <Input
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            type="email"
            value={email}
            className=""
          />

          <Button className="" type="button" onClick={onCreateAppointment}>
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
}
