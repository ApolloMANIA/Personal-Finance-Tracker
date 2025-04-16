import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { SectionCards } from "@/components/section-cards"
import { CustomTable } from "@/components/custom-table"
import { AuthContext } from "@/context/AuthContext"
import { BASE_URL } from "@/utils/config"
import React, { useState, useContext, useEffect } from 'react';
import transformTransactionData from "@/services/transformTransactionData"

interface Props {
    _id:string,
    user:string,
    type:string,
    name:string,
    balance:number,
    transactions: {
      date: string;
      debited: number;
      credited: number;
    }[];
  };

  interface Transaction {
    _id: string;
    type: string;
    amount: number;
    account: string;
    date: string; // Can be converted to `Date` if necessary
}

interface Account {
    _id: string;
    userId: string;
    name: string;
    type: string;
    balance: number;
    transactions: Transaction[];
}

export default function Home() {
  const { user } = useContext(AuthContext);
  const [accData, setAccData] = useState<Props[]|null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  



  useEffect(() => {
    if (!user || !user.token) return;
  
    const fetchAccounts = async () => {
      try {
        const response = await fetch(`${BASE_URL}/account/${user.id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
  
        if (!response.ok) throw new Error("Error fetching data");
  
        let body = await response.json();
        let accounts = body.data.accounts;

        if (!accounts || accounts.length === 0) {
          console.warn("No accounts found in response");
          return;
        }
  
        let account1 = accounts[0];
        if (account1?.transactions) {
          setTransactions(account1.transactions);
        } else {
          console.warn("No transactions found in first account");
        }
  
        setAccData(accounts);
        accounts = accounts.map((account: Account) => ({
          ...account,
          transactions: transformTransactionData(account.transactions || []),
        }));
  
        setAccData(accounts);
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
  
  useEffect(() => {
    // console.log("Updated Transactions:", transactions);
  }, [transactions]);




  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {accData && (
            <SectionCards
            />
          )}
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive accounts={accData||[]}/>
          </div>
          <CustomTable/>
        </div>
      </div>
    </div>
  );
}
