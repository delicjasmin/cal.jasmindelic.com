"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormDescriptionTemp,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { PasswordInput } from "@/components/ui/password-input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
const validationSchema = z
  .object({
    email: z.string().email({ message: "Enter a valid email" }),
    code: z.string(),
    password: z
      .string()
      .min(8, { message: "Password must have at least 8 characters" })
      .regex(/(?:[A-Z])/, {
        message: "Must contain at least one capital letter",
      })
      .regex(/(?:[0-9])/, { message: "Must contain at least one number" }),
    confirmPassword: z
      .string()
      .min(1, { message: "Confirm Password is required" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type ValidationSchema = z.infer<typeof validationSchema>;

const resetConfirmRequest = async (data: ValidationSchema) => {
  const reqParams = {
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  };

  const res = await fetch("/api/auth/confirm-password-reset", reqParams);

  return await res.json();
};

const resendRequest = async (email: string) => {
  const reqParams = {
    body: JSON.stringify({ email }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  };

  const res = await fetch("/api/auth/resend-confirm-email", reqParams);

  const result = await res.json();
  if (result.error) {
    const error = new Error(result.error.message || "Unkown error");
    // error.code = result.error.code || 'UNKNOWN_ERROR';
    throw error;
  }

  return result;
};

export default function ConfirmPasswordReset({ email }: { email: string }) {
  const router = useRouter();

  const form = useForm<ValidationSchema>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      code: "",
      confirmPassword: "",
      email: email,
      password: "",
    },
  });

  const confirmReset = useMutation({
    mutationFn: resetConfirmRequest,
  });

  const onSubmit: SubmitHandler<ValidationSchema> = (data) => {
    confirmReset.mutateAsync(data).then(() => router.push("/login"));
  };

  const resendConfirmationCode = useMutation({
    mutationFn: resendRequest,
  });

  const onResend = (email: string) => {
    resendConfirmationCode.mutate(email);
  };

  return (
    <div className="mx-auto mt-10 flex w-96 flex-col gap-7 rounded-xl border-2 p-10">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Code</FormLabel>
                <FormControl>
                  <InputOTP
                    containerClassName="justify-center"
                    {...field}
                    maxLength={5}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                    </InputOTPGroup>
                    <InputOTPGroup>
                      <InputOTPSlot index={1} />
                    </InputOTPGroup>
                    <InputOTPGroup>
                      <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPGroup>
                      <InputOTPSlot index={3} />
                    </InputOTPGroup>
                    <InputOTPGroup>
                      <InputOTPSlot index={4} />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormDescription>
                  {confirmReset.isError ? (
                    <p className="font-medium text-red-500">
                      The code you&apos;ve entered is not valid.
                    </p>
                  ) : (
                    "Enter the code from the email we sent you"
                  )}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your new password</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder="********"
                    {...field}
                  ></PasswordInput>
                </FormControl>
                <FormDescriptionTemp>
                  Must contain at least 8 characters, one capital letter and one
                  digit
                </FormDescriptionTemp>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder="********"
                    {...field}
                  ></PasswordInput>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button className="w-full" type="submit">
            Submit
          </Button>
        </form>
      </Form>
      <div className="flex flex-col gap-3 border-t-2 pt-7 text-sm text-muted-foreground">
        <p>Didn&apos;t receive your code?</p>
        <Button
          className="w-full"
          disabled={resendConfirmationCode.isSuccess}
          onClick={() => onResend(email)}
        >
          {resendConfirmationCode.isSuccess
            ? "Check your inbox"
            : "Resend code"}
        </Button>
      </div>
    </div>
  );
}
