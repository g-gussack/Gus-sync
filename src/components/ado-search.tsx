import { useState } from "react";
import { Link2, Loader2, X, AlertCircle, Check } from "lucide-react";
import { cn } from "@/utils/tailwind";
import type { ADOWorkItem, ADOConfig } from "@/types/topic";
import { useAdoWorkItem } from "@/hooks/use-ado";

interface AdoSearchProps {
  config: ADOConfig | null;
  onSelect: (workItem: ADOWorkItem) => void;
  onCancel: () => void;
  className?: string;
}

export default function AdoSearch({
  config,
  onSelect,
  onCancel,
  className,
}: AdoSearchProps) {
  const [idInput, setIdInput] = useState("");
  const [fetchedWorkItem, setFetchedWorkItem] = useState<ADOWorkItem | null>(null);
  
  const { isLoading, error, fetchWorkItem } = useAdoWorkItem(config);

  const handleFetch = async () => {
    const id = parseInt(idInput, 10);
    if (isNaN(id)) return;

    const workItem = await fetchWorkItem(id);
    if (workItem) {
      setFetchedWorkItem(workItem);
    }
  };

  const handleLink = () => {
    if (fetchedWorkItem) {
      onSelect(fetchedWorkItem);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIdInput(e.target.value);
    setFetchedWorkItem(null); // Clear previous result when input changes
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (fetchedWorkItem) {
        handleLink();
      } else {
        handleFetch();
      }
    }
  };

  if (!config) {
    return (
      <div
        className={cn(
          "glass-card p-4 text-center text-white/60 text-sm",
          className
        )}
      >
        <AlertCircle className="w-5 h-5 mx-auto mb-2 text-yellow-400" />
        <p>ADO is not configured. Go to Settings to set up your connection.</p>
      </div>
    );
  }

  return (
    <div className={cn("glass-card p-4 space-y-3", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-white/70">Link Work Item by ID</span>
        <button
          type="button"
          onClick={onCancel}
          className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ID Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">
            #
          </span>
          <input
            type="number"
            value={idInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Enter work item ID (e.g. 12345)"
            className={cn(
              "w-full bg-white/10 border border-white/20 rounded-lg",
              "pl-8 pr-4 py-2 text-white placeholder-white/40 text-sm",
              "focus:outline-none focus:ring-2 focus:ring-white/30"
            )}
            autoFocus
          />
        </div>
        <button
          type="button"
          onClick={handleFetch}
          disabled={!idInput || isLoading}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium",
            "bg-white/20 text-white",
            "hover:bg-white/30 transition-colors",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "flex items-center gap-2"
          )}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Fetch"
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      {/* Fetched Work Item Preview */}
      {fetchedWorkItem && (
        <div className="bg-white/5 border border-white/20 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-400" />
            <span className="text-xs text-green-400">Work item found!</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-blue-300 font-mono">
              #{fetchedWorkItem.id}
            </span>
          </div>
          <p className="text-sm text-white">{fetchedWorkItem.title}</p>
          <button
            type="button"
            onClick={handleLink}
            className={cn(
              "w-full px-4 py-2 rounded-lg text-sm font-medium",
              "bg-green-500/20 text-green-300 border border-green-500/30",
              "hover:bg-green-500/30 transition-colors",
              "flex items-center justify-center gap-2"
            )}
          >
            <Link2 className="w-4 h-4" />
            Link This Work Item
          </button>
        </div>
      )}

      {/* Help text */}
      {!fetchedWorkItem && !error && (
        <p className="text-xs text-white/40">
          Enter the work item ID from Azure DevOps and click Fetch to verify it exists.
        </p>
      )}
    </div>
  );
}
