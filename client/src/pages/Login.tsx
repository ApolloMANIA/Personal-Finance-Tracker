import React, { FormEvent, useRef, useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/config"
import { AuthContext } from "@/context/AuthContext";
import { toast } from "sonner";

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

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const [submitting, setSubmitting] = useState(false)

  const navigate = useNavigate();
  const { dispatch } = useContext(AuthContext);

  const handleFormSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!emailRef.current || !passwordRef.current) return;

    const formData = {
      email: emailRef.current.value,
      password: passwordRef.current.value,
    }

    dispatch({ type: 'LOGIN_START' })
    setSubmitting(true)
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (!response.ok) {
        dispatch({ type: 'LOGIN_FAILURE', payload: result.message || "Login failed" })
        toast.error(result.message || "Login failed")
        return;
      }

      dispatch({ type: 'LOGIN_SUCCESS', payload: result.data })
      toast.success("Welcome back!")
      navigate('/');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Login failed"
      dispatch({ type: 'LOGIN_FAILURE', payload: message })
      toast.error(message)
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
        <p className="text-sm text-muted-foreground">Built to track your money</p>
      </div>
      <Card className="rounded-3xl border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form method="post" onSubmit={handleFormSubmit}>
            <div className="flex flex-col gap-5">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  ref={emailRef}
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="h-11 rounded-xl"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  ref={passwordRef}
                  id="password"
                  type="password"
                  className="h-11 rounded-xl"
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="h-11 w-full rounded-full font-semibold" disabled={submitting}>
                {submitting ? "Signing in..." : "Login"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="font-semibold text-primary underline-offset-4 hover:underline">
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
