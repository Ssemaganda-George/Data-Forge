import { cn, formatNumber } from "@/lib/utils";
import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: { value: string; positive: boolean };
  className?: string;
}

export function StatCard({ label, value, icon, trend, className }: StatCardProps) {
  const displayValue =
    typeof value === "number" ? formatNumber(value) : value;

  return (
    <div className={cn("stat-card", className)}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {label}
        </p>
        <span className="text-gray-400">{icon}</span>
      </div>
      <p className="text-2xl font-semibold text-gray-900">{displayValue}</p>
      {trend && (
        <p
          className={cn(
            "mt-1 text-xs font-medium",
            trend.positive ? "text-green-600" : "text-red-600"
          )}
        >
          {trend.positive ? "↑" : "↓"} {trend.value} vs last month
        </p>
      )}
    </div>
  );
}
