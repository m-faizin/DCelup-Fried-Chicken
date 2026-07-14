import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";

export const Route = createFileRoute('/app')({
  component: AppLayout, // <-- Menggunakan AppLayout yang aman dari bentrok SSR
})

function AppLayout() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect jika tidak ada user yang login
  useEffect(() => {
    if (!isLoading && !user) {
      navigate({ to: "/auth", replace: true });
    }
  }, [isLoading, user, navigate]);

  // Tampilkan efek loading berputar selagi sistem mengecek localStorage
  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-red border-t-transparent" />
      </div>
    );
  }

  return <AppShell />;
}