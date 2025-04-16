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
import { DatePicker } from "@/components/date-picker";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface AccountProp{
  _id:string;
  user: string;
  type: string;
  name: string;
  balance: string;
}

export function Transaction({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [type, setType] = useState<HTMLInputElement|string>("Credited");
  const [account, setAccount] = useState<string|null>(null);
  const amountRef = useRef<HTMLInputElement | null>(null)
  const { user } = useContext(AuthContext);
  const navigate = useNavigate()
  const [userAccounts, setUserAccounts] = useState<AccountProp[]|[]>([]);


  useEffect(()=>{
    if(!user || !user.token)return;
    const fetchAccounts = async()=>{
      try{

      const response = await fetch(`${BASE_URL}/account/${user.id}`,{
        headers:{Authorization:`Bearer ${user.token}`},
      });
      if(!response.ok) throw new Error("Error fetching data");
      const body = await response.json();
      console.log(body)
      const accounts = body.data.accounts;
      console.log(accounts)
      setUserAccounts(accounts);
      }catch(error){
        console.log(error);
      }
    }

    fetchAccounts();
    const intervalId = setInterval(fetchAccounts,15000);
    return()=>clearInterval(intervalId);
  },[user]);


  const handleFormSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!type || !amountRef.current || !selectedDate) {
      return
    }
    const formData = {
      type: type,
      amount: parseFloat(amountRef.current.value),
      account:account,
      date: selectedDate
    }

    if (!user || !user.token) {
      return
    }
    try {
      const response = await fetch(`${BASE_URL}/monthlyData/addTransaction/${user.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify(formData)
      })
      if (response.ok) {
        setType("Credited");
        alert("Transaction added");
      } else {
        const error = await response.json()
        console.log(error)
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Add Transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFormSubmit} >
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <DatePicker onSelect={setSelectedDate} />
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">

                <Select onValueChange={(value) => { setAccount(value) }}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your account" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Account Type</SelectLabel>
                      {userAccounts.map((acc)=>(<SelectItem key={acc._id} value={acc.name}>{acc.name}</SelectItem>))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Select onValueChange={(value) => { setType(value) }}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type of the transaction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Transaction Type</SelectLabel>
                      <SelectItem value="Credited">Credited</SelectItem>
                      <SelectItem value="Debited">Debited</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              </div>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Input
                  ref={amountRef}
                  id="amount"
                  type="number"
                  placeholder="$100.00(Enter total amount)"
                  className="w-full"
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                Add Transaction
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
