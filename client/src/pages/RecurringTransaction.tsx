import React, { useContext, FormEvent, useRef, useState, useCallback } from "react";
import { BASE_URL } from "../utils/config"
import { AuthContext } from "@/context/AuthContext";
import { useRefetchOnFocus } from "@/hooks/useRefetchOnFocus"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
import { RecurrTable } from "@/components/recurr-table";

interface AccountProp{
  _id:string;
  user: string;
  type: string;
  name: string;
  balance: string;
}

export function RecurringTransaction({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [type, setType] = useState<HTMLInputElement|string>("Credited");
  const [account, setAccount] = useState<string|null>(null);
  const frequencyRef = useRef<HTMLInputElement|null>(null)
  const amountRef = useRef<HTMLInputElement | null>(null)
  const { user } = useContext(AuthContext);
  const [userAccounts, setUserAccounts] = useState<AccountProp[]|[]>([]);
  const [listKey, setListKey] = useState(0);

  const fetchAccounts = useCallback(async () => {
    if (!user?.token) return
    try {
      const response = await fetch(`${BASE_URL}/account/${user.id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      if (!response.ok) throw new Error("Error fetching data")
      const body = await response.json()
      setUserAccounts(body.data.accounts || [])
    } catch (error) {
      console.log(error)
    }
  }, [user])

  useRefetchOnFocus(fetchAccounts, Boolean(user?.token))


  const handleFormSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!type || !amountRef.current || !selectedDate || !frequencyRef.current) {
      return
    }
    const formData = {
      type: type,
      amount: parseFloat(amountRef.current.value),
      account:account,
      date: selectedDate,
      frequency: frequencyRef.current.value,
    }
    console.log(formData)

    if (!user || !user.token) {
      return
    }
    try {
      const response = await fetch(`${BASE_URL}/recurring/add/${user.id}`, {
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
        setListKey((k) => k + 1);
      } else {
        const error = await response.json()
        console.log(error)
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className={cn("mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 pb-8 md:px-6", className)} {...props}>
      <Card className="rounded-3xl border-border/70 shadow-none">
        <CardHeader>
          <CardTitle className="text-xl">Add recurring</CardTitle>
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
              </div>

            <div className="flex flex-col gap-6">
            <div className="grid gap-2">
                <Input
                  ref={frequencyRef}
                  id="frequency"
                  type="number"
                  placeholder="10 (set frequency in terms of months)"
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
      <RecurrTable key={listKey} />
    </div>
  )
}
