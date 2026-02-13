import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import TopicForm from "@/components/topic-form";
import TopicList from "@/components/topic-list";
import TopicEditModal from "@/components/topic-edit-modal";
import { useTopics } from "@/hooks/use-topics";
import type { Topic, InternalTag, ExternalTag, ADOWorkItem } from "@/types/topic";

function ExternalPage() {
  const { externalTopics, addTopic, toggleHot, markComplete, updateTopic, removeTopic, updateResults, addNote, isLoading } =
    useTopics();
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);

  const handleAddTopic = async (
    description: string,
    tags: (InternalTag | ExternalTag)[],
    priority: number,
    adoWorkItem?: ADOWorkItem
  ) => {
    await addTopic(description, "external", tags, priority, adoWorkItem);
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
          External Topics
        </h1>
        <span className="text-sm text-white/60">
          {externalTopics.length} item{externalTopics.length !== 1 ? "s" : ""}
        </span>
      </div>

      <TopicForm type="external" existingTopicCount={externalTopics.length} onSubmit={handleAddTopic} />

      <TopicList
        topics={externalTopics}
        onToggleHot={toggleHot}
        onComplete={markComplete}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onUpdateResults={updateResults}
        onAddNote={addNote}
        emptyMessage="No external topics. Add one above to get started."
      />

      {/* Edit Modal */}
      {editingTopic && (
        <TopicEditModal
          topic={editingTopic}
          maxPriority={externalTopics.length}
          onSave={handleSaveEdit}
          onCancel={() => setEditingTopic(null)}
        />
      )}
    </div>
  );
}

export const Route = createFileRoute("/external")({
  component: ExternalPage,
});
