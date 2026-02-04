import { useState } from "react";
import { Flame, Check, ExternalLink, Pencil, Trash2, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/utils/tailwind";
import type { Topic } from "@/types/topic";
import PriorityBadge from "./priority-badge";
import { TagBadges } from "./tag-selector";
import { openExternalLink } from "@/actions/shell";

interface TopicCardProps {
  topic: Topic;
  onToggleHot: (id: string, isHot: boolean) => void;
  onComplete: (id: string) => void;
  onEdit?: (topic: Topic) => void;
  onDelete?: (id: string) => void;
  onUpdateResults?: (id: string, results: string) => void;
  showPriority?: boolean;
}

export default function TopicCard({
  topic,
  onToggleHot,
  onComplete,
  onEdit,
  onDelete,
  onUpdateResults,
  showPriority = true,
}: TopicCardProps) {
  const [isResultsExpanded, setIsResultsExpanded] = useState(false);
  const [resultsText, setResultsText] = useState(topic.results || "");
  const [isSaving, setIsSaving] = useState(false);

  const hasResults = topic.results && topic.results.trim().length > 0;
  const canComplete = hasResults;

  const handleAdoLinkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (topic.adoWorkItem?.url) {
      openExternalLink(topic.adoWorkItem.url);
    }
  };

  const handleDelete = () => {
    if (onDelete && window.confirm("Are you sure you want to delete this topic?")) {
      onDelete(topic.id);
    }
  };

  const handleComplete = () => {
    if (!canComplete) {
      setIsResultsExpanded(true);
      return;
    }
    onComplete(topic.id);
  };

  const handleSaveResults = async () => {
    if (onUpdateResults && resultsText !== topic.results) {
      setIsSaving(true);
      await onUpdateResults(topic.id, resultsText);
      setIsSaving(false);
    }
  };

  const handleResultsBlur = () => {
    handleSaveResults();
  };

  return (
    <div className="glass-card p-4 space-y-3 group">
      <div className="flex items-start gap-4">
        {/* Priority Badge */}
        {showPriority && <PriorityBadge priority={topic.priority} />}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Description */}
          <p className="text-white text-sm text-glass leading-relaxed">
            {topic.description}
          </p>

          {/* Meta row: Tags + ADO Link */}
          <div className="flex items-center gap-3 mt-2">
            <TagBadges tags={topic.tags} />

            {topic.adoWorkItem && (
              <button
                onClick={handleAdoLinkClick}
                className={cn(
                  "flex items-center gap-1.5 text-xs",
                  "text-blue-300 hover:text-blue-200 transition-colors",
                  "hover:underline"
                )}
              >
                <ExternalLink className="w-3 h-3" />
                <span>
                  ADO-{topic.adoWorkItem.id}: {topic.adoWorkItem.title}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Edit button */}
          {onEdit && (
            <button
              onClick={() => onEdit(topic)}
              className={cn(
                "p-2 rounded-lg transition-all duration-200",
                "text-blue-400/70 hover:text-blue-400 hover:bg-blue-400/20"
              )}
              title="Edit topic"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}

          {/* Delete button */}
          {onDelete && (
            <button
              onClick={handleDelete}
              className={cn(
                "p-2 rounded-lg transition-all duration-200",
                "text-red-400/70 hover:text-red-400 hover:bg-red-400/20"
              )}
              title="Delete topic"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {/* Complete button */}
          <button
            onClick={handleComplete}
            className={cn(
              "p-2 rounded-lg transition-all duration-200",
              canComplete
                ? "text-green-400/70 hover:text-green-400 hover:bg-green-400/20"
                : "text-white/30 hover:text-white/50 hover:bg-white/10"
            )}
            title={canComplete ? "Mark as complete" : "Add results before completing"}
          >
            <Check className="w-4 h-4" />
          </button>

          {/* Hot toggle */}
          <button
            onClick={() => onToggleHot(topic.id, !topic.isHot)}
            className={cn(
              "p-2 rounded-lg transition-all duration-200",
              topic.isHot
                ? "text-orange-400 bg-orange-400/20 hot-glow"
                : "text-orange-400/50 hover:text-orange-400 hover:bg-orange-400/20"
            )}
            title={topic.isHot ? "Remove from Hot" : "Add to Hot"}
          >
            <Flame className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Results Section Toggle */}
      <button
        onClick={() => setIsResultsExpanded(!isResultsExpanded)}
        className={cn(
          "flex items-center gap-2 text-xs transition-colors w-full",
          hasResults
            ? "text-green-400/70 hover:text-green-400"
            : "text-white/40 hover:text-white/60"
        )}
      >
        <FileText className="w-3.5 h-3.5" />
        <span>{hasResults ? "Results added" : "Add results (required to complete)"}</span>
        {isResultsExpanded ? (
          <ChevronUp className="w-3.5 h-3.5 ml-auto" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 ml-auto" />
        )}
      </button>

      {/* Results Input */}
      {isResultsExpanded && (
        <div className="space-y-2">
          <textarea
            value={resultsText}
            onChange={(e) => setResultsText(e.target.value)}
            onBlur={handleResultsBlur}
            placeholder="Enter results, notes, or outcomes..."
            className={cn(
              "w-full bg-white/5 border border-white/10 rounded-lg",
              "px-3 py-2 text-white/90 placeholder-white/30 text-sm",
              "focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20",
              "resize-none"
            )}
            rows={3}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/40">
              {isSaving ? "Saving..." : resultsText !== topic.results ? "Unsaved changes" : "Auto-saved"}
            </span>
            {resultsText !== topic.results && (
              <button
                onClick={handleSaveResults}
                disabled={isSaving}
                className={cn(
                  "px-3 py-1 text-xs rounded",
                  "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white",
                  "transition-colors"
                )}
              >
                Save
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
