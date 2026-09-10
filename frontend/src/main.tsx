import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./lib/auth";
import PaymentCallback from "./pages/PaymentCallback";
import AccountSettings from "./pages/AccountSettings";
import AdminDashboard from "./pages/AdminDashboard";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import Trends from "./pages/Trends";
import AIStudio from "./pages/AIStudio";
import StudioLibrary from "./pages/StudioLibrary";
import ContentPlanner from "./pages/ContentPlanner";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/trends" element={<Trends />} />
          <Route path="/ai-studio" element={<AIStudio />} />
          <Route path="/studio-library" element={<StudioLibrary />} />
          <Route path="/planner" element={<ContentPlanner />} />
          <Route path="/account" element={<AccountSettings />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/payment/callback" element={<PaymentCallback />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
