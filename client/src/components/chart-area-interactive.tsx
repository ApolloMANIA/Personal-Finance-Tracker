"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";



interface Transaction {
  type: string;
  amount: number;
  date: string;
}

interface DailyData {
  date: string;
  debited: number;
  credited: number;
}
interface Props {
    _id:string,
    user:string,
    type:string,
    name:string,
    balance:number,
    transactions:DailyData[];
  };

export const description = "An interactive area chart for multiple accounts";

const chartConfig = {
  visitors: {
    label: "Account Activity",
  },
  debited: {
    label: "Debited",
    color: "var(--chart-2)",
  },
  credited: {
    label: "Credited",
    color: "var(--chart-1)",
  },
};

export function ChartAreaInteractive({accounts} : {accounts:Props[]}) {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("90d");
  const [selectedAccount, setSelectedAccount] = React.useState(accounts[0]?.name || "");

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  const selectedAccountData = accounts.find(
    (account) => account.name === selectedAccount
  )?.transactions;

  // Check if selectedAccountData is an array before filtering
  const filteredData = Array.isArray(selectedAccountData)
    ? selectedAccountData.filter((item) => {
        const date = new Date(item.date);
        const referenceDate = new Date(Date.now());
        let daysToSubtract = 90;
        if (timeRange === "30d") {
          daysToSubtract = 30;
        } else if (timeRange === "7d") {
          daysToSubtract = 7;
        }
        const startDate = new Date(referenceDate);
        startDate.setDate(startDate.getDate() - daysToSubtract);
        return date >= startDate;
      })
    : []; // Return empty array if selectedAccountData is not an array

  return (
    <>
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Account Activity</CardTitle>
        <CardDescription>
          <Select value={selectedAccount} onValueChange={setSelectedAccount}>
            <SelectTrigger className="flex w-40 *:data-[slot=select-value]:block *:data-[slot=select-value]:truncate" size="sm" aria-label="Select an account">
              <SelectValue placeholder="Select Account" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {accounts.map((account) => (
                <SelectItem key={account.name} value={account.name} className="rounded-lg">
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="@[540px]/card:hidden">Last 3 months</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 *:data-[slot=select-value]:block *:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillDebited" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-debited)" stopOpacity={1.0} />
                <stop offset="95%" stopColor="var(--color-debited)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillCredited" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-credited)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-credited)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
              }}
            />
            <ChartTooltip
              cursor={false}
              defaultIndex={isMobile ? -1 : 10}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="credited"
              type="natural"
              fill="url(#fillCredited)"
              stroke="var(--color-credited)"
              stackId="a"
            />
            <Area
              dataKey="debited"
              type="natural"
              fill="url(#fillDebited)"
              stroke="var(--color-debited)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
     </CardContent>
    </Card>
    {/* <CustomTable transactions={}/> */}

    </>
  );
}