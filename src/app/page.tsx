"use client";

import Link from "next/link";
import { useAuth } from "bndy-ui/auth";
import { BndyLogo } from "bndy-ui";

export default function Home() {
  const { currentUser, signOut } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-slate-900">
      <main className="text-center">
        <div className="mb-8">
          <BndyLogo className="mx-auto w-48 md:w-64" color="#f97316" holeColor="#0f172a" />
        </div>

        <h1 className="text-4xl font-bold mb-4 text-white">
          Welcome to Bndy Portal
        </h1>
        
        {currentUser ? (
          <div className="space-y-4">
            <p className="text-slate-300">
              Welcome back, {currentUser.displayName || currentUser.email || currentUser.phoneNumber}
            </p>
            <button
              onClick={signOut}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-slate-300 mb-6">Please sign in to continue</p>
            <Link
              href="/auth"
              className="inline-block px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
            >
              Sign In / Register
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
