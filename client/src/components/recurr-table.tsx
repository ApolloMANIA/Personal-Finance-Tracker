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
  
  export function RecurrTable() {
    const { user } = useContext(AuthContext);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    // const [updateTransaction, setUpdateTransaction] = useState<Transaction | null>(null);
    const [updatedAmount, setUpdatedAmount] = useState("");
    // const [updatedAccount, setUpdatedAccount] = useState("");
  
    useEffect(() => {
      if (!user || !user.token) return;
     
  
  
      const fetchTransactions = async () => {
        try {
          const response = await fetch(`${BASE_URL}/recurring/${user.id}`, {
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
  
    const payData = {
      user:user?.id
    }
  
    const handlePay = async (id:string)=>{
      try{
      const response = await fetch(`${BASE_URL}/recurring/pay/${id}`,{
        method:"post",
        headers:{
          "Content-Type":"application/json",
          Authorization: `Bearer ${user?.token}`
        },
        body:JSON.stringify(payData)
      })
      if(response.ok){
        console.log(response)
      }
    }catch(error){
      console.log(error)
    }
  
    }

    const handleDelete = async (id:string)=>{
      try{
      const response = await fetch(`${BASE_URL}/recurring/delete/${id}`,{
        method:"delete",
        headers:{
          "Content-Type":"application/json",
          Authorization: `Bearer ${user?.token}`
        },
        body:JSON.stringify(payData)
      })
      if(response.ok){
        console.log(response)
      }
    }catch(error){
      console.log(error)
    }
  
    }
    
  
      
    return (
      <>
        <Separator className="my-4" />
        <Badge className="badge-table" variant="secondary">
          Recurring Transactions
        </Badge>
        <Table>
          <TableHeader>
            <TableRow>
  
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>Pay</TableHead>
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
                <TableCell><Button onClick={()=>handlePay(transaction._id)}>Pay</Button></TableCell>
                <TableCell><Button className="btn btn-danger" onClick={()=>handleDelete(transaction._id)}>Delete</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
          {/* <TableFooter>
            <TableRow>
              <TableCell colSpan={5}>Total</TableCell>
              <TableCell className="text-right">{total().toFixed(2)}</TableCell>
            </TableRow>
          </TableFooter> */}
        </Table>
      </>
    );
  }