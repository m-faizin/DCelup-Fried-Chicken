import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  loader: async () => {
    // This runs on both server and client before rendering component
    // On client, wait a tick to ensure hooks are ready
    if (typeof window !== "undefined") {
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    // Check auth from localStorage (client-side only)
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("dceLup_auth_user");
      if (raw) {
        const user = JSON.parse(raw);
        if (user.role === "hq_admin") {
          throw redirect({ to: "/app/hq" });
        }
        throw redirect({ to: "/app/outlet" });
      }
    }

    // No user, redirect to auth
    throw redirect({ to: "/auth" });
  },
  component: Index,
});

function Index() {
  // This component should never render due to loader redirect
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-red border-t-transparent" />
    </div>
  );
}
