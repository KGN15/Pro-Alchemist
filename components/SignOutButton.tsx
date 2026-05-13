"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      className="rounded-lg bg-white/10 px-4 py-2 text-sm hover:bg-white/20"
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      লগআউট
    </button>
  );
}
