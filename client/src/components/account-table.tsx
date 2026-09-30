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

interface Account {
  _id: string
  type: string
  name: string
}

export function AccountTable() {
  const { user } = useContext(AuthContext)
  const [accounts, setAccounts] = useState<Account[]>([])

  const fetchAccounts = useCallback(async () => {
    if (!user?.token) return
    try {
      const response = await fetch(`${BASE_URL}/account/${user.id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      if (!response.ok) throw new Error("Error fetching data")
      const body = await response.json()
      setAccounts(body.data.accounts || [])
    } catch (error) {
      console.error("Error fetching account data:", error)
    }
  }, [user])

  useRefetchOnFocus(fetchAccounts, Boolean(user?.token))

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`${BASE_URL}/account/deleteAccount/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ user: user?.id }),
      })
      if (response.ok) {
        toast.success("Account deleted")
        await fetchAccounts()
      } else {
        toast.error("Could not delete account")
      }
    } catch (error) {
      console.log(error)
      toast.error("Could not delete account")
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
            <TableHead>Type</TableHead>
            <TableHead>Delete</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.map((account) => (
            <TableRow key={account._id}>
              <TableCell>{account.name}</TableCell>
              <TableCell>{account.type}</TableCell>
              <TableCell>
                <Button onClick={() => handleDelete(account._id)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}
