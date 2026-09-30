import { useContext, useState, useCallback } from "react"
import { AuthContext } from "@/context/AuthContext"
import { BASE_URL } from "@/utils/config"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { IconPencil, IconTrash } from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useRefetchOnFocus } from "@/hooks/useRefetchOnFocus"

export interface TransactionRow {
  _id: string
  type: string
  amount: string
  account: string
  date: string
}

function formatMoney(value: string | number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value) || 0)
}

interface CustomTableProps {
  /** When provided, skip the internal fetch and use this list. */
  transactions?: TransactionRow[]
  onChanged?: () => void
}

export function CustomTable({ transactions: externalTransactions, onChanged }: CustomTableProps) {
  const { user } = useContext(AuthContext)
  const [internalTransactions, setInternalTransactions] = useState<TransactionRow[]>([])
  const [updatedAmount, setUpdatedAmount] = useState("")
  const controlled = externalTransactions !== undefined
  const transactions = controlled ? externalTransactions : internalTransactions

  const fetchTransactions = useCallback(async () => {
    if (controlled || !user?.token) return
    try {
      const response = await fetch(`${BASE_URL}/account/getAllTransactions/${user.id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      if (!response.ok) throw new Error("Error fetching data")
      const body = await response.json()
      const fetched: TransactionRow[] = body.data || []
      fetched.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setInternalTransactions(fetched)
    } catch (error) {
      console.error("Error fetching account data:", error)
    }
  }, [controlled, user])

  useRefetchOnFocus(fetchTransactions, !controlled && Boolean(user?.token))

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`${BASE_URL}/account/deleteTransaction/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ user: user?.id }),
      })
      if (response.ok) {
        toast.success("Transaction deleted")
        if (controlled) onChanged?.()
        else await fetchTransactions()
      } else {
        toast.error("Could not delete transaction")
      }
    } catch (error) {
      console.log(error)
      toast.error("Could not delete transaction")
    }
  }

  const confirmUpdate = async (id: string) => {
    try {
      const response = await fetch(`${BASE_URL}/account/updateTransaction/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ user: user?.id, amount: updatedAmount }),
      })
      if (response.ok) {
        toast.success("Transaction updated")
        setUpdatedAmount("")
        if (controlled) onChanged?.()
        else await fetchTransactions()
      } else {
        toast.error("Could not update transaction")
      }
    } catch (error) {
      console.log(error)
      toast.error("Could not update transaction")
    }
  }

  if (transactions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-secondary/40 px-4 py-10 text-center text-sm text-muted-foreground">
        No transactions yet. Add income or an expense to see activity here.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
      {transactions.slice(0, 12).map((transaction, index) => {
        const credited = transaction.type === "Credited"
        return (
          <div
            key={transaction._id}
            className={cn(
              "flex items-center gap-3 px-4 py-3.5",
              index !== Math.min(transactions.length, 12) - 1 && "border-b border-border/70"
            )}
          >
            <span
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-full",
                credited ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
              )}
            >
              {credited ? "+" : "−"}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {credited ? "Income" : "Expense"} · {transaction.account}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(transaction.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
            <p
              className={cn(
                "mr-1 text-sm font-semibold tabular-nums",
                credited ? "text-emerald-600" : "text-foreground"
              )}
            >
              {credited ? "+" : "−"}
              {formatMoney(transaction.amount)}
            </p>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8 rounded-full">
                  <IconPencil className="size-3.5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 rounded-2xl">
                <div className="flex flex-col gap-3">
                  <Label htmlFor={`amount-${transaction._id}`}>Update amount</Label>
                  <Input
                    id={`amount-${transaction._id}`}
                    type="number"
                    value={updatedAmount}
                    onChange={(e) => setUpdatedAmount(e.target.value)}
                    className="rounded-xl"
                  />
                  <Button className="rounded-full" onClick={() => confirmUpdate(transaction._id)}>
                    Save
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-full text-muted-foreground hover:text-destructive"
              onClick={() => handleDelete(transaction._id)}
            >
              <IconTrash className="size-3.5" />
            </Button>
          </div>
        )
      })}
    </div>
  )
}
