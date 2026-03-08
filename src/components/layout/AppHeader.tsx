"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export function AppHeader({ title }: { title?: string }) {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth/login");
  };

  return (
    <header className="h-14 border-b border-[#ECECF2] bg-white flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-3">
        {title && <h1 className="text-lg font-bold text-[#1C1D21]">{title}</h1>}
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <>
            <span className="text-sm text-[#8181A5]">{user.email}</span>
            <button
              onClick={handleSignOut}
              className="text-sm text-[#8181A5] hover:text-[#1C1D21] transition-colors"
            >
              Sign Out
            </button>
          </>
        )}
      </div>
    </header>
  );
}
