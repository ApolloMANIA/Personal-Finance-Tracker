import React, { useContext, useEffect, FormEvent, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/config"
import useFetch from "@/hooks/useFetch";
import { AuthContext } from "@/context/AuthContext";


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

  const navigate = useNavigate();
  const { dispatch } = useContext(AuthContext);
  const handleFormSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!emailRef.current || !passwordRef.current) {
      return;
    }

    const formData = {
      email: emailRef.current.value,
      password: passwordRef.current.value,
    }

    dispatch({ type: 'LOGIN_START' })
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'post',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      if (!response.ok) {
        alert(result.message);
      }

      console.log("here")
      dispatch({ type: 'LOGIN_SUCCESS', payload: result.data })
      navigate('/');

    } catch (error: any) {
      dispatch({ type: 'LOGIN_FAILURE', payload: error.message })
      console.log("Login Failed")

    }
  }


  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form method="post" onSubmit={handleFormSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  ref={emailRef}
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input ref={passwordRef} id="password" type="password" required />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="underline underline-offset-4">
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
