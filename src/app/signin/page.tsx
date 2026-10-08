"use client";

import { signIn, useSession, signOut } from "@/lib/auth-client";

export default function SignInPage() {
  const { data: session, isPending } = useSession();

  if (isPending) return <div className="p-8">Loading...</div>;

  if (session) {
    return (
      <div className="p-8 space-y-4">
        <h1 className="text-2xl font-bold">You are signed in</h1>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(session, null, 2)}
        </pre>
        <button
          onClick={() => signOut()}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">KamPlug Auth Test</h1>
      <button
        onClick={() =>
          signIn.social({ provider: "google", callbackURL: "/signin" })
        }
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Sign in with Google
      </button>
    </div>
  );
}