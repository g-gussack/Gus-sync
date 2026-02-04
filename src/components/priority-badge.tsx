import { cn } from "@/utils/tailwind";

interface PriorityBadgeProps {
  priority: number;
  className?: string;
}

export default function PriorityBadge({
  priority,
  className,
}: PriorityBadgeProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center",
        "w-8 h-8 rounded-lg",
        "bg-white/20 text-white font-bold text-sm",
        "text-glass",
        className
      )}
    >
      {priority}
    </div>
  );
}
