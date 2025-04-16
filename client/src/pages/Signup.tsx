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

import React, {useState,useContext,useEffect} from 'react';
import { Link, useNavigate } from "react-router-dom"
import { FormEvent, useRef } from "react"
import { AuthContext } from "@/context/AuthContext"
import {BASE_URL} from "../utils/config"


export function SignupForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {

  const navigate = useNavigate();

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const {dispatch} = useContext(AuthContext);

  async function handleFormSubmit(event: FormEvent) {
    event.preventDefault();

    if (!nameRef.current || !emailRef.current || !passwordRef.current) return;

    const formData = {
      name: nameRef.current.value,
      email: emailRef.current.value,
      password: passwordRef.current.value,
    };

    try {
      const response = await fetch(`${BASE_URL}/auth/signup`,{
        method:"post",
    headers:{
     "Content-Type": "application/json",
    },
    body:JSON.stringify(formData)
  });

    const result = await response.json();
    if (!response.ok){
      alert(result.message)
    }

    dispatch({type:'REGISTER_SUCCESS'});
    navigate('/login');

  }catch(error:any){
    alert(error.message);
  }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>Register for our website.</CardDescription>
        </CardHeader>
        <CardContent>
          <form method="post" onSubmit={handleFormSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  ref={emailRef}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  ref={nameRef}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" ref={passwordRef} required />
              </div>
              <Button type="submit" className="w-full">
                Sign Up
              </Button>
              <Button variant="outline" className="w-full">
                Sign up with Google?
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <a href="/login" className="underline underline-offset-4">
                Login
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
