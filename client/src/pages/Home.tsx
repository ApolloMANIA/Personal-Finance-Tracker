import { AuthContext } from "@/context/AuthContext"
import { BASE_URL } from "@/utils/config"
import { useState, useContext, useMemo, useCallback, lazy, Suspense } from "react"
import { Link } from "react-router-dom"
import {
  IconArrowDownLeft,
  IconArrowUpRight,
  IconPlus,
  IconRepeat,
  IconWallet,
} from "@tabler/icons-react"
import { CustomTable, type TransactionRow } from "@/components/custom-table"
import transformTransactionData from "@/services/transformTransactionData"
import { cn } from "@/lib/utils"
import { useRefetchOnFocus } from "@/hooks/useRefetchOnFocus"

const ChartAreaInteractive = lazy(() =>
  import("@/components/chart-area-interactive").then((m) => ({
    default: m.ChartAreaInteractive,
  }))
)

interface ChartAccount {
  _id: string
  user: string
  type: string
  name: string
  balance: number
  transactions: {
    date: string
    debited: number
    credited: number
  }[]
}

interface Account {
  _id: string
  name: string
  type: string
  balance: number
  transactions?: Array<{
    _id?: string
    type: string
    amount: number | string
    account?: string
    date: string
  }>
}

interface HeaderData {
  income: number
  expense: number
  savings: number
  growth: number
}

const accountColors = [
  "bg-[#0052ff]",
  "bg-[#00a3ff]",
  "bg-[#22c55e]",
  "bg-[#f59e0b]",
  "bg-[#0ea5e9]",
  "bg-[#64748b]",
]

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value >= 1000 ? 0 : 2,
  }).format(value || 0)
}

export default function Home() {
  const { user } = useContext(AuthContext)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [transactions, setTransactions] = useState<TransactionRow[]>([])
  const [header, setHeader] = useState<HeaderData>({
    income: 0,
    expense: 0,
    savings: 0,
    growth: 0,
  })

  const loadDashboard = useCallback(async () => {
    if (!user?.token) return
    try {
      const response = await fetch(`${BASE_URL}/account/${user.id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      if (!response.ok) throw new Error("Error fetching data")

      const body = await response.json()
      const rawAccounts: Account[] = body.data?.accounts || []
      setAccounts(rawAccounts)
      if (body.data?.headerData) setHeader(body.data.headerData)

      const flat: TransactionRow[] = rawAccounts
        .flatMap((account) =>
          (account.transactions || []).map((t) => ({
            _id: t._id || `${account._id}-${t.date}-${t.amount}`,
            type: t.type,
            amount: String(t.amount),
            account: t.account || account.name,
            date: t.date,
          }))
        )
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      setTransactions(flat)
    } catch (error) {
      console.error("Error fetching account data:", error)
    }
  }, [user])

  useRefetchOnFocus(loadDashboard, Boolean(user?.token))

  const chartAccounts = useMemo(() => {
    if (!user || accounts.length === 0) return [] as ChartAccount[]
    return accounts.map((account) => ({
      ...account,
      user: user.id,
      transactions: transformTransactionData(
        (account.transactions || []).map((t) => ({
          type: t.type,
          amount: Number(t.amount),
          date: t.date,
        }))
      ),
    })) as ChartAccount[]
  }, [accounts, user])

  const totalBalance = useMemo(
    () => accounts.reduce((sum, account) => sum + Number(account.balance || 0), 0),
    [accounts]
  )

  const actions = [
    {
      label: "Income",
      to: "/transaction",
      icon: IconArrowDownLeft,
      className: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100",
    },
    {
      label: "Expense",
      to: "/transaction",
      icon: IconArrowUpRight,
      className: "bg-rose-50 text-rose-600 hover:bg-rose-100",
    },
    {
      label: "Account",
      to: "/account",
      icon: IconPlus,
      className: "bg-blue-50 text-primary hover:bg-blue-100",
    },
    {
      label: "Recurring",
      to: "/recurr",
      icon: IconRepeat,
      className: "bg-slate-100 text-slate-700 hover:bg-slate-200",
    },
  ]

  return (
    <div className="flex flex-1 flex-col gap-8 px-4 pb-8 pt-2 md:px-8">
      <section className="animate-fade-up flex flex-col items-center pt-6 text-center md:pt-10">
        <p className="text-sm font-medium text-muted-foreground">Total balance</p>
        <h2 className="mt-2 text-5xl font-extrabold tracking-tight text-[color:var(--hero)] md:text-6xl">
          {formatMoney(totalBalance)}
        </h2>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-muted-foreground">
          <span className="rounded-full bg-secondary px-2.5 py-1">
            Income {formatMoney(header.income)}
          </span>
          <span className="rounded-full bg-secondary px-2.5 py-1">
            Spent {formatMoney(header.expense)}
          </span>
          <span
            className={cn(
              "rounded-full px-2.5 py-1",
              header.growth >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
            )}
          >
            {header.growth >= 0 ? "+" : ""}
            {header.growth}% vs last month
          </span>
        </div>

        <div className="animate-fade-up-delay mt-8 flex flex-wrap items-center justify-center gap-3 md:gap-4">
          {actions.map((action) => (
            <Link
              key={action.label}
              to={action.to}
              className={cn(
                "group flex w-[72px] flex-col items-center gap-2 rounded-2xl p-2 transition md:w-20",
                "hover:-translate-y-0.5"
              )}
            >
              <span
                className={cn(
                  "flex size-12 items-center justify-center rounded-full transition md:size-14",
                  action.className
                )}
              >
                <action.icon className="size-5 md:size-6" />
              </span>
              <span className="text-xs font-semibold text-foreground/80">{action.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="animate-fade-up-delay-2 mx-auto w-full max-w-3xl">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-tight">Accounts</h3>
          <Link to="/account" className="text-xs font-semibold text-primary hover:underline">
            Manage
          </Link>
        </div>

        {accounts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-secondary/40 px-4 py-10 text-center">
            <IconWallet className="mx-auto mb-2 size-8 text-muted-foreground" />
            <p className="text-sm font-medium">No accounts yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Create an account to start tracking balances.
            </p>
            <Link
              to="/account"
              className="mt-4 inline-flex h-9 items-center rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground"
            >
              Add account
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
            {accounts.map((account, index) => (
              <div
                key={account._id}
                className={cn(
                  "flex items-center gap-3 px-4 py-3.5 transition hover:bg-secondary/50",
                  index !== accounts.length - 1 && "border-b border-border/70"
                )}
              >
                <span
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white",
                    accountColors[index % accountColors.length]
                  )}
                >
                  {account.name.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{account.name}</p>
                  <p className="text-xs text-muted-foreground">{account.type}</p>
                </div>
                <p className="text-sm font-semibold tabular-nums">
                  {formatMoney(Number(account.balance))}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {chartAccounts.length > 0 && (
        <section className="mx-auto w-full max-w-3xl">
          <h3 className="mb-3 text-sm font-semibold tracking-tight">Cash flow</h3>
          <Suspense
            fallback={
              <div className="h-64 animate-pulse rounded-2xl bg-secondary/60" aria-hidden />
            }
          >
            <ChartAreaInteractive accounts={chartAccounts} />
          </Suspense>
        </section>
      )}

      <section className="mx-auto w-full max-w-3xl">
        <h3 className="mb-3 text-sm font-semibold tracking-tight">Recent activity</h3>
        <CustomTable transactions={transactions} onChanged={loadDashboard} />
      </section>
    </div>
  )
}
