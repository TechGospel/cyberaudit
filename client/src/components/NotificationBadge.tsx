import { cn } from "@/lib/utils";

interface NotificationBadgeProps {
  count: number;
  className?: string;
}

export function NotificationBadge({
  count,
  className,
}: NotificationBadgeProps) {
  if (count === 0) return null;

  return (
    <span
      className={cn(
        "absolute top-5 right-2 transform -translate-y-1/2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium z-10",
        className,
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
