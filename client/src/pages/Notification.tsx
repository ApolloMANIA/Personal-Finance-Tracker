

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"


import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import { BASE_URL } from "@/utils/config";
import { Link, Navigate } from "react-router-dom";

interface Transaction {
    _id: string;
    type: string;
    amount: string;
    account: string;
    date: string;
}

export default function Notifications() {
    const { user } = useContext(AuthContext);
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    useEffect(() => {
        if (!user || !user.token) return;
        const fetchTransactions = async () => {
            try {
                const response = await fetch(`${BASE_URL}/recurring/${user.id}`, {
                    headers: { Authorization: `Bearer ${user.token}` },
                });

                if (!response.ok) throw new Error("Error fetching data");

                let body = await response.json();
                console.log(body)
                let fetchedTransactions: Transaction[] = body.data;

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

                console.log(transactions)
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





return (
    <>

        <Alert>
      {transactions.length>0 ? (
        transactions.map((transaction) => {
          const transactionDate = new Date(transaction.date);
          const currentDate = new Date();
  
          const timeDifference = transactionDate.getTime() - currentDate.getTime();
          const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));
  
          return (
            <AlertTitle key={transaction._id}>
              Transaction due in {daysDifference < 0 ? 30+daysDifference : daysDifference} days
              <AlertDescription>
                {transaction._id.substring(0,5)+"..."} | ${transaction.amount} | {transaction.account} 
              </AlertDescription>
            </AlertTitle>
          );
        })
      ) : (
      <AlertTitle>No due transactions found.</AlertTitle>

      )}

    </Alert>
    </>
  )}