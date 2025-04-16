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
  
 
  import { Separator } from "./ui/separator";
  import { Badge } from "./ui/badge";
  import { useContext, useEffect, useState } from "react";
  import { AuthContext } from "@/context/AuthContext";
  import { BASE_URL } from "@/utils/config";
  import { Button } from "./ui/button";
  
  interface Account {
    _id: string;
    type: string;
    name: string;
  }
  
  export function AccountTable() {
    const { user } = useContext(AuthContext);
    const [accounts, setAccounts] = useState<Account[]>([]);
  
    useEffect(() => {
      if (!user || !user.token) return;
      const fetchAccounts = async () => {
        try {
          const response = await fetch(`${BASE_URL}/account/${user.id}`, {
            headers: { Authorization: `Bearer ${user.token}` },
          });
  
          if (!response.ok) throw new Error("Error fetching data");
  
          let body = await response.json();
          let fetchedAccounts: Account[] = body.data.accounts;
  
          setAccounts(fetchedAccounts);
        } catch (error) {
          console.error("Error fetching account data:", error);
        }
      };
  
      fetchAccounts();
      const intervalId = setInterval(fetchAccounts, 10000);
      return () => {
        clearInterval(intervalId);
      };
    }, [user]);
  
    const deleteData = {
      user:user?.id
    }
  
    const handleDelete = async (id:string)=>{
      try{
      const response = await fetch(`${BASE_URL}/account/deleteAccount/${id}`,{
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
    
  
    return (
      <>
        <Separator className="my-4" />
        <Badge className="badge-table" variant="secondary">
          Accounts
        </Badge>
        <Table>
          <TableHeader>
            <TableRow>
  
              <TableHead>Name</TableHead>
              {/* <TableHead className="w-[100px]">Id</TableHead> */}
              <TableHead>Type</TableHead>
              <TableHead>Delete</TableHead>
              
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account) => (
              <TableRow key={account._id}>
                {/* <TableCell className="font-medium">{transaction._id.substring(0,4)+"..."}</TableCell> */}
                <TableCell>{account.name}</TableCell>
                <TableCell>{account.type}</TableCell>
                <TableCell><Button onClick={()=>handleDelete(account._id)}>Delete</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </>
    );
  }




