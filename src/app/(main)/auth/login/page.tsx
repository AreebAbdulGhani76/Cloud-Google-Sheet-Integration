import type { Metadata } from "next";

import { AdminLoginView } from "@/components/auth/admin-login-view";

export const metadata: Metadata = {
  title: "Admin Login | Studio Admin",
  description: "Sign in with administrator credentials stored in environment variables.",
  alternates: {
    canonical: "/auth/login",
  },
};

export default function AuthLoginPage() {
  return <AdminLoginView />;
}
