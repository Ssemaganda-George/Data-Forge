"use client";

import { useState } from "react";

export function AdminSignOut() {
  const [confirming, setConfirming] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await fetch("/api/auth/signout", { method: "POST" });
      window.location.href = "/";
    } catch {
      setSigningOut(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className="space-y-2">
        <p className="text-xs text-[#4A6461] text-center">
          Are you sure you want to sign out?
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setConfirming(false)}
            disabled={signingOut}
            className="flex-1 text-xs font-medium text-[#0B2E2C] border border-[#E5E7EB] rounded-md px-2 py-1.5 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex-1 text-xs font-medium text-white bg-[#028090] rounded-md px-2 py-1.5 hover:bg-[#026c78] transition-colors disabled:opacity-50"
          >
            {signingOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="w-full text-left text-sm text-red-600 hover:bg-red-50 rounded-md px-3 py-2 transition-colors"
    >
      Sign out
    </button>
  );
}
