import { createFileRoute } from "@tanstack/react-router";
import { Archive, Trash2, RotateCcw } from "lucide-react";
import { cn } from "@/utils/tailwind";
import { useTopics } from "@/hooks/use-topics";
import { TagBadges } from "@/components/tag-selector";

function ArchivePage() {
  const { completedTopics, removeTopic, unarchiveTopic, isLoading } = useTopics();

  // Sort by completion date (most recent first)
  const sortedTopics = [...completedTopics].sort((a, b) => {
    const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
    const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
    return dateB - dateA;
  });

  const handleUnarchive = async (id: string) => {
    await unarchiveTopic(id);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to permanently delete this topic?")) {
      removeTopic(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white/60 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Archive className="w-6 h-6 text-white/70" />
          <h1 className="text-xl font-semibold text-white text-glass">
            Archive
          </h1>
        </div>
        <span className="text-sm text-white/60">
          {completedTopics.length} completed item
          {completedTopics.length !== 1 ? "s" : ""}
        </span>
      </div>

      <p className="text-sm text-white/50">
        Completed topics are stored here for reference. Click the restore icon to move back to the original tab.
      </p>

      {sortedTopics.length === 0 ? (
        <div className="glass-card p-8 text-center text-white/50 text-sm">
          No completed topics yet. Mark topics as complete to see them here.
        </div>
      ) : (
        <div className="space-y-2">
          {sortedTopics.map((topic) => (
            <div
              key={topic.id}
              className="glass-card p-4 flex items-start gap-4 group opacity-70 hover:opacity-100 transition-opacity"
            >
              {/* Type indicator */}
              <div
                className={cn(
                  "px-2 py-1 rounded text-xs font-medium",
                  topic.type === "internal"
                    ? "bg-blue-500/20 text-blue-300"
                    : "bg-purple-500/20 text-purple-300"
                )}
              >
                {topic.type === "internal" ? "INT" : "EXT"}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-white/80 text-sm line-through">
                  {topic.description}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <TagBadges tags={topic.tags} />
                  {topic.completedAt && (
                    <span className="text-xs text-white/40">
                      Completed{" "}
                      {new Date(topic.completedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {topic.results && (
                  <div className="mt-2 p-2 bg-white/5 rounded-lg">
                    <p className="text-xs text-white/50 mb-1">Results:</p>
                    <p className="text-sm text-white/70">{topic.results}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Restore button */}
                <button
                  onClick={() => handleUnarchive(topic.id)}
                  className={cn(
                    "p-2 rounded-lg transition-all duration-200",
                    "text-green-400/70 hover:text-green-400 hover:bg-green-400/20"
                  )}
                  title={`Restore to ${topic.type === "internal" ? "Internal" : "External"} tab`}
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Delete button */}
                <button
                  onClick={() => handleDelete(topic.id)}
                  className={cn(
                    "p-2 rounded-lg transition-all duration-200",
                    "text-red-400/70 hover:text-red-400 hover:bg-red-400/20"
                  )}
                  title="Delete permanently"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute("/archive")({
  component: ArchivePage,
});
