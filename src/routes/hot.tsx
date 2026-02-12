import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Flame } from "lucide-react";
import TopicList from "@/components/topic-list";
import TopicEditModal from "@/components/topic-edit-modal";
import { useTopics } from "@/hooks/use-topics";
import type { Topic } from "@/types/topic";

function HotPage() {
  const { hotTopics, internalTopics, externalTopics, toggleHot, markComplete, updateTopic, removeTopic, updateResults, isLoading } = useTopics();
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);

  // Get max priority based on topic type
  const getMaxPriority = (topic: Topic) => {
    return topic.type === "internal" ? internalTopics.length : externalTopics.length;
  };

  const handleEdit = (topic: Topic) => {
    setEditingTopic(topic);
  };

  const handleSaveEdit = async (updatedTopic: Topic) => {
    await updateTopic(updatedTopic);
    setEditingTopic(null);
  };

  const handleDelete = async (id: string) => {
    await removeTopic(id);
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
          <Flame className="w-6 h-6 text-orange-400" />
          <h1 className="text-xl font-semibold text-white text-glass">
            Hot Topics
          </h1>
        </div>
        <span className="text-sm text-white/60">
          {hotTopics.length} item{hotTopics.length !== 1 ? "s" : ""}
        </span>
      </div>

      <p className="text-sm text-white/50">
        High priority items from both Internal and External tabs. Click the fire
        icon on any topic to add or remove it from this list.
      </p>

      <TopicList
        topics={hotTopics}
        onToggleHot={toggleHot}
        onComplete={markComplete}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onUpdateResults={updateResults}
        showPriority={false}
        emptyMessage="No hot topics. Mark items as hot from the Internal or External tabs."
      />

      {/* Edit Modal */}
      {editingTopic && (
        <TopicEditModal
          topic={editingTopic}
          maxPriority={getMaxPriority(editingTopic)}
          onSave={handleSaveEdit}
          onCancel={() => setEditingTopic(null)}
        />
      )}
    </div>
  );
}

export const Route = createFileRoute("/hot")({
  component: HotPage,
});
