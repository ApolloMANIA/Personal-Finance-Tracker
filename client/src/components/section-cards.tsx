import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { AuthContext } from "@/context/AuthContext"
import { BASE_URL } from "@/utils/config"
import { useState, useContext, useEffect } from 'react';


interface headerData {
  income: number;
  expense: number;
  savings: number;
  growth: number;
  incomeGrowth: number;
  expenseGrowth: number;
  savingsGrowth: number;

}

const fakeData:headerData = {
  income : 0,
  expense : 0,
  savings : 0,
  growth:0,
  incomeGrowth:0,
  expenseGrowth:0,
  savingsGrowth:0
}



export function SectionCards() {

  const { user } = useContext(AuthContext);
  const [userHeaderData, setUserHeaderData] = useState<headerData>(fakeData);


  useEffect(() => {
    if (!user || !user.token) return;

    const fetchAccounts = async () => {
      try {
        const response = await fetch(`${BASE_URL}/account/${user.id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        if (!response.ok) throw new Error("Error fetching data");

        let body = await response.json();
        let headerData: headerData = body.data.headerData;

        setUserHeaderData(headerData);
        
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
    console.log(userHeaderData)
  }, [userHeaderData]);

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Income</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            ${userHeaderData?.income}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {userHeaderData?.incomeGrowth > 0 ? <IconTrendingUp /> : <IconTrendingDown />}
              {userHeaderData?.incomeGrowth}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Trending up this month {userHeaderData?.incomeGrowth > 0 ? <IconTrendingUp className="size-4" /> : <IconTrendingDown className="size-4" />}
          </div>
          <div className="text-muted-foreground">
            Total of all accounts
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Expense</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            ${userHeaderData?.expense}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {userHeaderData?.expenseGrowth > 0 ? <IconTrendingUp /> : <IconTrendingDown />}
              {userHeaderData?.expenseGrowth}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">

            {userHeaderData?.expenseGrowth > 0 ? (
              <>Up {userHeaderData?.expenseGrowth}% this month <IconTrendingUp className="size-4" /></>
            ) : (
              <>
                Down {userHeaderData?.expenseGrowth}% this month <IconTrendingDown className="size-4" />
              </>)}
          </div>
          <div className="text-muted-foreground">
            {userHeaderData?.expenseGrowth <= 0 ? (<>
              Less expensive than last month
            </>) : (
              <>Expense are more than last month</>)}
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Savings</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            ${userHeaderData?.savings > 0 ? userHeaderData?.savings : 0}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">

              {userHeaderData?.savingsGrowth > 0 ? <IconTrendingUp /> : <IconTrendingDown />}
              {userHeaderData?.savingsGrowth}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {userHeaderData?.savingsGrowth > 0 ? (
              <>Up {userHeaderData?.savingsGrowth}% this month <IconTrendingUp className="size-4" /></>
            ) : (
              <>
                Down {userHeaderData?.savingsGrowth}% this month <IconTrendingDown className="size-4" />
              </>)}
          </div>
          <div className="text-muted-foreground">
            {userHeaderData?.savingsGrowth <= 0 ? (<>
              Savings are low compared to last month
            </>) : (
              <>Saving for the future</>)}
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Growth Rate</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {userHeaderData?.growth}%
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">

            {userHeaderData?.growth > 0 ? (
                <>Trending up this month <IconTrendingUp className="size-4" /></>
            ) : (
              <>
                Trending down this month <IconTrendingDown className="size-4" />
              </>)}

          </div>
          <div className="text-muted-foreground">
            {userHeaderData?.growth <= 0 ? (<>
              Account growth slow
            </>) : (
              <>Account growth steady</>)}
          </div>

        </CardFooter>
      </Card>
    </div>
  )
}
