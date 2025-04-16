import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"


import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import { BASE_URL } from "@/utils/config";
import { Button } from "./ui/button";

import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface Transaction {
  _id: string;
  type: string;
  amount: string;
  account: string;
  date: string;
}

export function CustomTable() {
  const { user } = useContext(AuthContext);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  // const [updateTransaction, setUpdateTransaction] = useState<Transaction | null>(null);
  const [updatedAmount, setUpdatedAmount] = useState("");
  // const [updatedAccount, setUpdatedAccount] = useState("");

  useEffect(() => {
    if (!user || !user.token) return;
   


    const fetchTransactions = async () => {
      try {
        const response = await fetch(`${BASE_URL}/account/getAllTransactions/${user.id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        if (!response.ok) throw new Error("Error fetching data");

        let body = await response.json();
        let fetchedTransactions: Transaction[] = body.data;

        // Sorting logic
        fetchedTransactions.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);

          if (dateA < dateB) return 1;
          if (dateA > dateB) return -1;

          if (a.account < b.account) return -1;
          if (a.account > b.account) return 1;

          return 0;
        });

        setTransactions(fetchedTransactions);
        // console.log(fetchedTransactions);
      } catch (error) {
        console.error("Error fetching account data:", error);
      }
    };

    fetchTransactions();
    const intervalId = setInterval(fetchTransactions, 10000);
    return () => {
      clearInterval(intervalId);
    };
  }, [user]);

  const deleteData = {
    user:user?.id
  }

  const handleDelete = async (id:string)=>{
    try{
    const response = await fetch(`${BASE_URL}/account/deleteTransaction/${id}`,{
      method:"DELETE",
      headers:{
        "Content-Type":"application/json",
        Authorization: `Bearer ${user?.token}`
      },
      body:JSON.stringify(deleteData)
    })
    if(response.ok){
      console.log(response)
    }
  }catch(error){
    console.log(error)
  }

  }
  

  const updateData = {
    user: user?.id,
    amount:updatedAmount
  }
  const confirmUpdate = async (id:string) => {
    try{
      console.log(updateData)
      const response = await fetch(`${BASE_URL}/account/updateTransaction/${id}`,{
        method:"PATCH",
        headers:{
          "Content-Type":"application/json",
          Authorization:`Bearer ${user?.token}`
        },
        body:JSON.stringify(updateData)
      })
      if(response.ok){
        console.log(response)
      }
    }catch(error){
      console.log(error)
    }
    };

  const cancelUpdate = () => {
  };


  const total = () => {
    if (!transactions) {
      return 0;
    }
    return transactions.reduce((sum, transaction) => {
      const amount = parseFloat(transaction.amount);
      if (transaction.type === "Credited") {
        return sum + amount;
      } else if (transaction.type === "Debited") {
        return sum - amount;
      } else {
        return sum;
      }
    }, 0);
  };

  return (
    <>
      <Separator className="my-4" />
      <Table>
        <TableCaption>A list of all transactions.</TableCaption>
        <TableHeader>
            <TableHead colSpan={5}>
              <Badge variant={"outline"} className="text-[16px]">
              Transactions total: ${total().toFixed(2)}
              </Badge>
               </TableHead>
          <TableRow>

            <TableHead>Date</TableHead>
            {/* <TableHead className="w-[100px]">Id</TableHead> */}
            <TableHead>Type</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Account</TableHead>
            <TableHead>Update</TableHead>
            <TableHead>Delete</TableHead>
            
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction._id}>
              {/* <TableCell className="font-medium">{transaction._id.substring(0,4)+"..."}</TableCell> */}
              <TableCell>{
                new Date(transaction.date).toLocaleDateString("en-US",{
                  month:"short",
                  day:"numeric",
                  year:"numeric"
                })
              }</TableCell>
              <TableCell>{transaction.type}</TableCell>
              <TableCell>{transaction.amount}</TableCell>
              <TableCell>{transaction.account}</TableCell>
              <TableCell>
              <Popover>
                  <PopoverTrigger asChild>
                    <Button>Update</Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="flex flex-col space-y-4">
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={updatedAmount}
                        onChange={(e) => setUpdatedAmount(e.target.value)}
                      />
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={cancelUpdate}>
                          Cancel
                        </Button>
                        <Button onClick={()=>confirmUpdate(transaction._id)}>Confirm</Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </TableCell>
              <TableCell><Button onClick={()=>handleDelete(transaction._id)}>Delete</Button></TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>

        </TableFooter>
      </Table>
    </>
  );
}