"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth-client";

export default function AuthPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGoogle() {
    setLoading(true);
    setError("");
    try {
      await signIn.social({
        provider: "google",
        callbackURL: "/onboarding",
      });
       } catch{
      setError("Could not sign in. Try again.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-4xl font-bold text-teal-900">KamPlug</h1>
          <p className="text-gray-600">
            Buy and sell on your campus.
          </p>
        </div>

        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.32A9 9 0 0 0 9 18z"/>
            <path fill="#FBBC05" d="M3.97 10.72a5.41 5.41 0 0 1 0-3.44V4.96H.96a9 9 0 0 0 0 8.08l3.01-2.32z"/>
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.34l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.96l3.01 2.32C4.68 5.16 6.66 3.58 9 3.58z"/>
          </svg>
          <span className="font-medium">
            {loading ? "Signing in..." : "Continue with Google"}
          </span>
        </button>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</p>
        )}

        <p className="text-xs text-center text-gray-500">
          By continuing, you agree to our Terms and Privacy Policy.
        </p>
      </div>
    </main>
  );
}