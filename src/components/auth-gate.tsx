"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { LoginPage } from "@/components/login-page";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isReady } = useAuth();
  const pathname = usePathname();
  const isResetPasswordPage = pathname === "/reset-password";

  if (!isReady) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
        <div className="h-10 w-10 animate-pulse rounded-full bg-accent/50" />
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!isAuthenticated && !isResetPasswordPage) {
    return <LoginPage />;
  }

  return <>{children}</>;
}
