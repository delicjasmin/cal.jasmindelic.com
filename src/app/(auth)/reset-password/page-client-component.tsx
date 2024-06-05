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
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

const validationSchema = z.object({
  email: z.string().email({ message: "Enter a valid email" }),
});

type ValidationSchema = z.infer<typeof validationSchema>;

const passwordResetRequest = async (data: ValidationSchema) => {
  const reqParams = {
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  };

  const res = await fetch("/api/auth/reset-password", reqParams);

  return await res.json();
};

export default function ResetPassword() {
  const router = useRouter();

  const form = useForm<ValidationSchema>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      email: "",
    },
  });

  const resetPassword = useMutation({
    mutationFn: passwordResetRequest,
  });

  const onSubmit: SubmitHandler<ValidationSchema> = (data) => {
    resetPassword
      .mutateAsync(data)
      .then(() => router.push(`/confirm-password-reset?email=${data.email}`));
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto mt-10 w-96 space-y-8 rounded-xl border-2 p-10"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="your@email.com" {...field}></Input>
              </FormControl>
              <FormDescription>
                If you want you want your password to be reset, just enter your
                email here
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button className="w-full" type="submit">
          Submit
        </Button>
      </form>
    </Form>
  );
}
