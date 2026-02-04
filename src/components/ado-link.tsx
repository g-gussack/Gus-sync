import { ExternalLink, Unlink } from "lucide-react";
import { cn } from "@/utils/tailwind";
import type { ADOWorkItem } from "@/types/topic";
import { openExternalLink } from "@/actions/shell";

interface AdoLinkProps {
  workItem: ADOWorkItem;
  onUnlink?: () => void;
  className?: string;
}

export default function AdoLink({ workItem, onUnlink, className }: AdoLinkProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    openExternalLink(workItem.url);
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 group",
        className
      )}
    >
      <button
        onClick={handleClick}
        className={cn(
          "flex items-center gap-1.5 text-xs",
          "text-blue-300 hover:text-blue-200 transition-colors",
          "hover:underline"
        )}
      >
        <ExternalLink className="w-3 h-3" />
        <span>
          ADO-{workItem.id}: {workItem.title}
        </span>
      </button>

      {onUnlink && (
        <button
          onClick={onUnlink}
          className={cn(
            "p-1 rounded transition-all duration-200",
            "text-white/30 hover:text-red-400 hover:bg-red-400/20",
            "opacity-0 group-hover:opacity-100"
          )}
          title="Unlink work item"
        >
          <Unlink className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

// Compact display for cards
interface AdoLinkBadgeProps {
  workItem: ADOWorkItem;
  className?: string;
}

export function AdoLinkBadge({ workItem, className }: AdoLinkBadgeProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    openExternalLink(workItem.url);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs",
        "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30",
        "transition-colors",
        className
      )}
    >
      <ExternalLink className="w-3 h-3" />
      <span>ADO-{workItem.id}</span>
    </button>
  );
}
