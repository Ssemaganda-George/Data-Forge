"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[dashboard] render error:", error);
  }, [error]);

  const isConnectivity =
    /reach database server|can't reach|ECONNREFUSED|connection/i.test(
      error.message
    );

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="text-lg font-semibold text-gray-900">
        {isConnectivity
          ? "We couldn't reach the database"
          : "Something went wrong"}
      </h1>
      <p className="mt-2 max-w-md text-sm text-gray-500">
        {isConnectivity
          ? "The database may be waking up or temporarily unavailable. This usually resolves in a few seconds — please try again."
          : "An unexpected error occurred while loading your dashboard. Please try again."}
      </p>
      <div className="mt-6">
        <Button variant="primary" onClick={() => reset()}>
          Try again
        </Button>
      </div>
    </div>
  );
}
