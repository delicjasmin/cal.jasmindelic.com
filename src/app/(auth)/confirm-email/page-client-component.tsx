"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

const validationSchema = z.object({
  email: z.string().email({ message: "Enter a valid email" }),
  code: z.string().length(5),
});

type ValidationSchema = z.infer<typeof validationSchema>;

const confirmationRequest = async (data: ValidationSchema) => {
  const reqParams = {
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  };

  const res = await fetch("/api/auth/confirm-email", reqParams);

  const result = await res.json();
  if (result.error) {
    const error = new Error(result.error.message || "Unkown error");
    // error.code = result.error.code || 'UNKNOWN_ERROR';
    throw error;
  }

  return result;
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

export default function ConfirmEmail({ email }: { email: string }) {
  const [isResendHidden, setIsResendHidden] = useState(true);
  const router = useRouter();

  const form = useForm<ValidationSchema>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      code: "",
      email: email,
    },
  });

  const confirmEmail = useMutation({
    mutationFn: confirmationRequest,
  });

  const onSubmit: SubmitHandler<ValidationSchema> = (data) => {
    confirmEmail
      .mutateAsync(data)
      .then(() => router.push("/login"))
      .catch((error) => console.warn(error));
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 ">
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
                    onComplete={() => onSubmit({ code: field.value, email })}
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
                  {confirmEmail.isError ? (
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
        </form>
      </Form>
      <div className="flex flex-col gap-3 border-t-2 pt-7 text-sm text-muted-foreground">
        <p className="cursor-pointer" onClick={() => setIsResendHidden(false)}>
          Didn&apos;t receive your code?
        </p>
        <Button
          className={`w-full ${isResendHidden ? "hidden" : ""}`}
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
