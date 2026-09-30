import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { useCallback, useContext, useState } from "react"
import { AuthContext } from "@/context/AuthContext"
import { BASE_URL } from "@/utils/config"
import { useRefetchOnFocus } from "@/hooks/useRefetchOnFocus"

interface Transaction {
  _id: string
  type: string
  amount: string
  account: string
  date: string
}

export default function Notifications() {
  const { user } = useContext(AuthContext)
  const [transactions, setTransactions] = useState<Transaction[]>([])

  const fetchTransactions = useCallback(async () => {
    if (!user?.token) return
    try {
      const response = await fetch(`${BASE_URL}/recurring/${user.id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      if (!response.ok) throw new Error("Error fetching data")

      const body = await response.json()
      const fetchedTransactions: Transaction[] = body.data || []

      fetchedTransactions.sort((a, b) => {
        const dateA = new Date(a.date).getTime()
        const dateB = new Date(b.date).getTime()
        if (dateA !== dateB) return dateA - dateB
        return a.account.localeCompare(b.account)
      })

      setTransactions(fetchedTransactions)
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }, [user])

  useRefetchOnFocus(fetchTransactions, Boolean(user?.token))

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-3 px-4 pb-8 md:px-6">
      {transactions.length > 0 ? (
        transactions.map((transaction) => {
          const transactionDate = new Date(transaction.date)
          const currentDate = new Date()
          currentDate.setHours(0, 0, 0, 0)
          transactionDate.setHours(0, 0, 0, 0)

          const daysDifference = Math.ceil(
            (transactionDate.getTime() - currentDate.getTime()) / (1000 * 3600 * 24)
          )

          let dueLabel: string
          if (daysDifference < 0) {
            dueLabel = `Overdue by ${Math.abs(daysDifference)} day${Math.abs(daysDifference) === 1 ? "" : "s"}`
          } else if (daysDifference === 0) {
            dueLabel = "Due today"
          } else {
            dueLabel = `Due in ${daysDifference} day${daysDifference === 1 ? "" : "s"}`
          }

          return (
            <Alert key={transaction._id}>
              <AlertTitle>{dueLabel}</AlertTitle>
              <AlertDescription>
                {transaction.type} · ${transaction.amount} · {transaction.account}
              </AlertDescription>
            </Alert>
          )
        })
      ) : (
        <Alert>
          <AlertTitle>No upcoming recurring payments</AlertTitle>
          <AlertDescription>
            Add a recurring transaction to see due reminders here.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
