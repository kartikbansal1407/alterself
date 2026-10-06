import { cn } from "@/lib/cn";

export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn("brand-mark", className)} aria-hidden="true">
      <span />
      <span />
    </span>
  );
}

