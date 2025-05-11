
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { Terminal } from "lucide-react";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  // password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export default function LoginForm() {
  const { login, enterGuestMode } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      // password: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // In a real app, password would be used. For mock, only email.
    login(values.email); 
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-secondary/30 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <Link href="/" className="flex items-center justify-center gap-2 text-2xl font-bold text-primary mb-2">
            <Terminal className="h-7 w-7" />
            <span>ConnectMe</span>
          </Link>
          <CardTitle className="text-2xl">Welcome Back!</CardTitle>
          <CardDescription>Log in to your ConnectMe account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
              <p className="text-xs text-muted-foreground">
                For demo purposes, password field is omitted. Any valid email format will log you in as a demo user.
              </p>
              <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                Login
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center text-sm">
            Don't have an account?{" "}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </div>
          <div className="mt-4 text-center text-sm">
            Or{" "}
            <Button variant="link" className="p-0 h-auto font-medium text-primary hover:underline" onClick={enterGuestMode}>
              Continue as Guest
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
