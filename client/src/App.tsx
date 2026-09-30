import Layout from "./app/dashboard/layout"
import { Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Account from "./pages/Account"
import { LoginForm } from "./pages/Login"
import { SignupForm } from "./pages/Signup"
import { Transaction } from "./pages/Transactions"
import Notifications from "./pages/Notification"
import { RecurringTransaction } from "./pages/RecurringTransaction"
import { ProtectedRoute, PublicOnlyRoute } from "./components/ProtectedRoute"
import { Toaster } from "@/components/ui/sonner"

export default function App() {
  return (
    <div>
      <Toaster richColors position="top-right" />
      <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout pageTitle="Home"><Home /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <Layout pageTitle="Account"><Account /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/recurr"
            element={
              <ProtectedRoute>
                <Layout pageTitle="Recurring Transactions"><RecurringTransaction /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Layout pageTitle="Notifications"><Notifications /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/transaction"
            element={
              <ProtectedRoute>
                <Layout pageTitle="Transaction"><Transaction /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <div className="flex min-h-svh items-center justify-center bg-[radial-gradient(circle_at_top,#dbe7ff,transparent_45%),linear-gradient(#f3f4f6,#eef2f7)] p-4">
                  <LoginForm className="w-full max-w-md" />
                </div>
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicOnlyRoute>
                <div className="flex min-h-svh items-center justify-center bg-[radial-gradient(circle_at_top,#dbe7ff,transparent_45%),linear-gradient(#f3f4f6,#eef2f7)] p-4">
                  <SignupForm className="w-full max-w-md" />
                </div>
              </PublicOnlyRoute>
            }
          />
          <Route path="*" element={<ProtectedRoute><Layout pageTitle="Home"><Home /></Layout></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  )
}
