import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Separator } from "./ui/separator"
import { Badge } from "./ui/badge"
import { useCallback, useContext, useState } from "react"
import { AuthContext } from "@/context/AuthContext"
import { BASE_URL } from "@/utils/config"
import { Button } from "./ui/button"
import { useRefetchOnFocus } from "@/hooks/useRefetchOnFocus"
import { toast } from "sonner"

interface Transaction {
  _id: string
  type: string
  amount: string
  account: string
  date: string
}

export function RecurrTable() {
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
      const fetched: Transaction[] = body.data || []
      fetched.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setTransactions(fetched)
    } catch (error) {
      console.error("Error fetching account data:", error)
    }
  }, [user])

  useRefetchOnFocus(fetchTransactions, Boolean(user?.token))

  const handlePay = async (id: string) => {
    try {
      const response = await fetch(`${BASE_URL}/recurring/pay/${id}`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ user: user?.id }),
      })
      if (response.ok) {
        toast.success("Payment recorded")
        await fetchTransactions()
      } else {
        toast.error("Could not pay")
      }
    } catch (error) {
      console.log(error)
      toast.error("Could not pay")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`${BASE_URL}/recurring/delete/${id}`, {
        method: "delete",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ user: user?.id }),
      })
      if (response.ok) {
        toast.success("Deleted")
        await fetchTransactions()
      } else {
        toast.error("Could not delete")
      }
    } catch (error) {
      console.log(error)
      toast.error("Could not delete")
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
              <TableCell>
                {new Date(transaction.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </TableCell>
              <TableCell>{transaction.type}</TableCell>
              <TableCell>{transaction.amount}</TableCell>
              <TableCell>{transaction.account}</TableCell>
              <TableCell>
                <Button onClick={() => handlePay(transaction._id)}>Pay</Button>
              </TableCell>
              <TableCell>
                <Button className="btn btn-danger" onClick={() => handleDelete(transaction._id)}>
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}
