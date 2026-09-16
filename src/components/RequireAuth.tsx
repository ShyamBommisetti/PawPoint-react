import { useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/lib/store";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, ready } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (ready && !user) navigate("/", { replace: true });
  }, [ready, user, navigate]);

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }
  return <>{children}</>;
}
