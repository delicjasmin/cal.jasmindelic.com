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
import { PasswordInput } from "@/components/ui/password-input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

const validationSchema = z.object({
  email: z.string().email({ message: "Enter a valid email" }),
  password: z.string().min(1, { message: "Enter your password" }),
});

type ValidationSchema = z.infer<typeof validationSchema>;

const loginRequest = async (data: { email: string; password: string }) => {
  const reqParams = {
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  };

  const res = await fetch("/api/auth/login", reqParams);

  const result = await res.json();
  if (result.error) {
    const error = new Error(result.error.message || "Unkown error");
    // error.code = result.error.code || 'UNKNOWN_ERROR';

    throw error;
  }

  return result;
};

export default function Login() {
  const router = useRouter();

  const form = useForm<ValidationSchema>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginUser = useMutation({
    mutationFn: loginRequest,
  });

  const onSubmit: SubmitHandler<ValidationSchema> = (data) => {
    loginUser
      .mutateAsync(data)
      .then(() => router.push("/dashboard"))
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
              <FormDescription>
                <a href="/reset-password">Can't remember you password?</a>
                <br />
                <a href="/signup">Don't have an account?</a>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {loginUser.isError ? (
          <div className="text-sm font-medium text-destructive">
            {loginUser.error.message}
          </div>
        ) : null}

        <Button className="w-full" type="submit">
          Submit
        </Button>
      </form>
    </Form>
  );
}
