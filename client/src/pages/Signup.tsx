import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import React, { useContext, useState, FormEvent, useRef } from 'react';
import { Link, useNavigate } from "react-router-dom"
import { AuthContext } from "@/context/AuthContext"
import { BASE_URL } from "../utils/config"
import { toast } from "sonner"

export function SignupForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false)

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const { dispatch } = useContext(AuthContext);

  async function handleFormSubmit(event: FormEvent) {
    event.preventDefault();

    if (!nameRef.current || !emailRef.current || !passwordRef.current) return;

    const formData = {
      name: nameRef.current.value,
      email: emailRef.current.value,
      password: passwordRef.current.value,
    };

    setSubmitting(true)
    try {
      const response = await fetch(`${BASE_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (!response.ok) {
        toast.error(result.message || "Signup failed")
        return;
      }

      dispatch({ type: 'REGISTER_SUCCESS' });
      toast.success("Account created. Please log in.")
      navigate('/login');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Signup failed"
      toast.error(message);
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="logo-mark flex size-12 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-[0_10px_30px_rgba(0,82,255,0.35)]">
          FT
        </span>
        <h1 className="text-2xl font-bold tracking-tight">Finance</h1>
        <p className="text-sm text-muted-foreground">Create an account to get started</p>
      </div>
      <Card className="rounded-3xl border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Sign Up</CardTitle>
          <CardDescription>Create your personal finance account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form method="post" onSubmit={handleFormSubmit}>
            <div className="flex flex-col gap-5">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Jane Doe"
                  ref={nameRef}
                  className="h-11 rounded-xl"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  ref={emailRef}
                  className="h-11 rounded-xl"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  ref={passwordRef}
                  className="h-11 rounded-xl"
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="h-11 w-full rounded-full font-semibold" disabled={submitting}>
                {submitting ? "Creating account..." : "Sign Up"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
                Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
