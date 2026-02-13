import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import TopicForm from "@/components/topic-form";
import TopicList from "@/components/topic-list";
import TopicEditModal from "@/components/topic-edit-modal";
import { useTopics } from "@/hooks/use-topics";
import type { Topic, InternalTag, ExternalTag, ADOWorkItem } from "@/types/topic";

function InternalPage() {
  const { internalTopics, addTopic, toggleHot, markComplete, updateTopic, removeTopic, updateResults, addNote, isLoading } =
    useTopics();
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);

  const handleAddTopic = async (
    description: string,
    tags: (InternalTag | ExternalTag)[],
    priority: number,
    adoWorkItem?: ADOWorkItem
  ) => {
    await addTopic(description, "internal", tags, priority, adoWorkItem);
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
        <h1 className="text-xl font-semibold text-white text-glass">
          Internal Topics
        </h1>
        <span className="text-sm text-white/60">
          {internalTopics.length} item{internalTopics.length !== 1 ? "s" : ""}
        </span>
      </div>

      <TopicForm type="internal" existingTopicCount={internalTopics.length} onSubmit={handleAddTopic} />

      <TopicList
        topics={internalTopics}
        onToggleHot={toggleHot}
        onComplete={markComplete}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onUpdateResults={updateResults}
        onAddNote={addNote}
        emptyMessage="No internal topics. Add one above to get started."
      />

      {/* Edit Modal */}
      {editingTopic && (
        <TopicEditModal
          topic={editingTopic}
          maxPriority={internalTopics.length}
          onSave={handleSaveEdit}
          onCancel={() => setEditingTopic(null)}
        />
      )}
    </div>
  );
}

export const Route = createFileRoute("/")({
  component: InternalPage,
});
