import Layout from "./app/dashboard/layout"
import { Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Account from "./pages/Account"
import {LoginForm} from "./pages/Login"
import {SignupForm} from "./pages/Signup"
import { Transaction } from "./pages/Transactions"
import Notifications from "./pages/Notification"
import {RecurringTransaction} from "./pages/RecurringTransaction"

export default function App() {
  return (
    <div>
      <main className="main-content">
        <Routes>
          <Route path="/"element={<Layout pageTitle="Home" ><Home/></Layout>}/>
          <Route path="/account"element={<Layout pageTitle="Account"><Account/></Layout>}/>
          <Route path="/recurr"element={<Layout pageTitle="Recurring Transactions"><RecurringTransaction/></Layout>}/>
          <Route path="/notifications"element={<Layout pageTitle="Notifications"><Notifications/></Layout>}/>
          <Route path="/transaction"element={<Layout pageTitle="Transaction"><Transaction/></Layout>}/>
        <Route path="/login" element={<LoginForm/>} />
        <Route path="/signup" element={<SignupForm/>} />
        </Routes>
      
      </main>
    </div>
  )
}
