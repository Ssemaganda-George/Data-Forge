import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant: "processing" | "ready" | "flagged" | "failed" | "pending";
}

const variantMap: Record<BadgeProps["variant"], string> = {
  processing: "badge-processing",
  ready: "badge-ready",
  flagged: "badge-flagged",
  failed: "badge-failed",
  pending: "badge-pending",
};

const labelMap: Record<BadgeProps["variant"], string> = {
  processing: "Processing",
  ready: "Ready",
  flagged: "Flagged",
  failed: "Failed",
  pending: "Pending",
};

export function Badge({ variant, className, children, ...props }: BadgeProps) {
  return (
    <span className={cn(variantMap[variant], className)} {...props}>
      {children ?? labelMap[variant]}
    </span>
  );
}
