import React, { useContext, useEffect, FormEvent, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/config"
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

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AccountTable } from "@/components/account-table";


export default function Account({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [type, setType] = useState<HTMLInputElement|String>("Savings");
  const nameRef = useRef<HTMLInputElement | null>(null)
  const balanceRef = useRef<HTMLInputElement | null>(null)
  const { user } = useContext(AuthContext);


  const handleFormSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!nameRef.current || !type || !balanceRef.current) {
      return
    }
    const formData = {
      type: type,
      name: nameRef.current.value,
      balance: balanceRef.current.value
    }
    console.log(formData)

    if (!user || !user.token) {
      return
    }

    console.log(formData)
    try{
      const response = await fetch(`${BASE_URL}/account/add/${user.id}`,{
        method:"POST",
        headers:{
          "Content-Type": "application/json",
          Authorization:`Bearer ${user.token}`
        },
        body:JSON.stringify(formData)
      })
      if(response.ok){
        nameRef.current.value = "";
        balanceRef.current.value = "";
        setType("Savings");
      }else{
        const error = await response.json()
        console.log(error)
      }
    }catch(error){
      console.log(error)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">User Account</CardTitle>
        </CardHeader>
        <CardContent>

          <form onSubmit={handleFormSubmit} >
            <div className="flex flex-col gap-6">
              <Select  onValueChange={(value)=>{setType(value)}}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select an account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Account Type</SelectLabel>
                    <SelectItem value="Checking">Checking</SelectItem>
                    <SelectItem value="Savings">Savings</SelectItem>
                    <SelectItem value="Credit">Credit</SelectItem>
                    <SelectItem value="Prepaid Credit">Prepaid Credit</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              </div>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                ref ={nameRef}
                  id="name"
                  type="text"
                  placeholder="ScotiaBank Account 1"
                  required
                />
              </div>
            </div>
              <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="name">Initial Balance</Label>
                <Input
                ref ={balanceRef}
                  id="name"
                  type="text"
                  placeholder="1000"
                  required
                />
              </div>
              
              <Button type="submit" className="w-full">
                Save Account
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <AccountTable/>
    </div>
  )
}
