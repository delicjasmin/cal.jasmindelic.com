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
import { PasswordInput } from "@/components/ui/password-input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

const validationSchema = z
  .object({
    email: z.string().email({ message: "Enter a valid email" }),
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
    name: z.string().min(1, { message: "Name is required" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type ValidationSchema = z.infer<typeof validationSchema>;

const signupRequest = async (data: ValidationSchema) => {
  const reqParams = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };

  const res = await fetch("/api/auth/signup", reqParams);

  const result = await res.json();
  if (result.error) {
    const error = new Error(result.error.message || "Unkown error");
    // error.code = result.error.code || 'UNKNOWN_ERROR';
    throw error;
  }

  return result;
};

export default function Signup() {
  const router = useRouter();

  const form = useForm<ValidationSchema>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      confirmPassword: "",
      email: "",
      name: "",
      password: "",
    },
  });

  const createUser = useMutation({
    mutationFn: signupRequest,
  });

  const onSubmit: SubmitHandler<ValidationSchema> = (data) => {
    createUser
      .mutateAsync(data)
      .then(() => router.push(`/confirm-email?email=${data.email}`))
      .catch(console.warn);
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
              {createUser.isError ? (
                <div className="text-sm font-medium text-destructive">
                  {createUser.error.message}
                </div>
              ) : null}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
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

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
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
