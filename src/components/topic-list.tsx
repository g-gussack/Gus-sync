import { cn } from "@/utils/tailwind";
import type { Topic } from "@/types/topic";
import TopicCard from "./topic-card";

interface TopicListProps {
  topics: Topic[];
  onToggleHot: (id: string, isHot: boolean) => void;
  onComplete: (id: string) => void;
  onEdit?: (topic: Topic) => void;
  onDelete?: (id: string) => void;
  onUpdateResults?: (id: string, results: string) => void;
  onAddNote?: (id: string, content: string) => void;
  showPriority?: boolean;
  emptyMessage?: string;
  className?: string;
}

export default function TopicList({
  topics,
  onToggleHot,
  onComplete,
  onEdit,
  onDelete,
  onUpdateResults,
  onAddNote,
  showPriority = true,
  emptyMessage = "No topics yet",
  className,
}: TopicListProps) {
  // Sort by priority (ascending - 1 is highest)
  const sortedTopics = [...topics].sort((a, b) => a.priority - b.priority);

  if (sortedTopics.length === 0) {
    return (
      <div
        className={cn(
          "glass-card p-8 text-center text-white/50 text-sm",
          className
        )}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {sortedTopics.map((topic) => (
        <TopicCard
          key={topic.id}
          topic={topic}
          onToggleHot={onToggleHot}
          onComplete={onComplete}
          onEdit={onEdit}
          onDelete={onDelete}
          onUpdateResults={onUpdateResults}
          onAddNote={onAddNote}
          showPriority={showPriority}
        />
      ))}
    </div>
  );
}
