"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export function Navbar() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <nav className="border-b border-[#ECECF2] bg-white">
      <div className="container mx-auto flex h-14 items-center px-4">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-[#5E81F4] flex items-center justify-center mr-2">
            <span className="text-white font-bold text-sm">R</span>
          </div>
          <span className="text-lg font-bold text-[#1C1D21]">Revenue Map</span>
        </Link>

        <div className="flex flex-1 items-center space-x-4">
          <Link href="/blog" className="text-sm text-[#8181A5] hover:text-[#1C1D21] transition-colors">
            Blog
          </Link>
          <Link href="/pricing" className="text-sm text-[#8181A5] hover:text-[#1C1D21] transition-colors">
            Pricing
          </Link>
          {user && (
            <>
              <Link href="/dashboard" className="text-sm text-[#8181A5] hover:text-[#1C1D21] transition-colors">
                Dashboard
              </Link>
              <Link href="/projects" className="text-sm text-[#8181A5] hover:text-[#1C1D21] transition-colors">
                Projects
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {loading ? null : user ? (
            <>
              <span className="text-sm text-[#8181A5] mr-2">{user.email}</span>
              <button onClick={handleSignOut} className="text-sm text-[#8181A5] hover:text-[#1C1D21] transition-colors">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <button className="h-9 px-4 text-sm text-[#1C1D21] font-bold hover:bg-[#F8F8FC] rounded-lg transition-colors">
                  Sign In
                </button>
              </Link>
              <Link href="/onboarding/survey">
                <button className="h-9 px-4 bg-[#5E81F4] text-white text-sm font-bold rounded-lg hover:bg-[#4B6FE0] transition-colors">
                  Get Started
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
