import { useState, useEffect, useCallback } from "react";
import type {
  Topic,
  TopicType,
  InternalTag,
  ExternalTag,
  ADOWorkItem,
  Note,
} from "@/types/topic";
import {
  getTopics,
  saveTopic,
  deleteTopic,
  updateTopicHotStatus,
  completeTopic,
} from "@/actions/storage";

// Generate a unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function useTopics() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load topics on mount
  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const loadedTopics = await getTopics();
      setTopics(loadedTopics);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load topics");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter helpers
  const internalTopics = topics.filter(
    (t) => t.type === "internal" && !t.isCompleted
  );
  const externalTopics = topics.filter(
    (t) => t.type === "external" && !t.isCompleted
  );
  const hotTopics = topics.filter((t) => t.isHot && !t.isCompleted);
  const completedTopics = topics.filter((t) => t.isCompleted);

  // Add a new topic
  const addTopic = useCallback(
    async (
      description: string,
      type: TopicType,
      tags: (InternalTag | ExternalTag)[],
      priority: number,
      adoWorkItem?: ADOWorkItem
    ) => {
      try {
        // Get existing topics of same type to adjust priorities
        const sameTypeTopics = topics.filter(
          (t) => t.type === type && !t.isCompleted
        );

        // Shift priorities of topics that are >= the new priority
        const updatedTopics = sameTypeTopics
          .filter((t) => t.priority >= priority)
          .map((t) => ({ ...t, priority: t.priority + 1 }));

        // Save the shifted topics
        for (const t of updatedTopics) {
          await saveTopic(t);
        }

        const now = new Date().toISOString();
        const newTopic: Topic = {
          id: generateId(),
          description,
          priority,
          type,
          tags,
          adoWorkItem,
          notes: [],
          isHot: false,
          isCompleted: false,
          createdAt: now,
          lastActivityAt: now,
        };

        const saved = await saveTopic(newTopic);
        
        // Update local state with all changes
        setTopics((prev) => {
          const updated = prev.map((t) => {
            const shifted = updatedTopics.find((u) => u.id === t.id);
            return shifted || t;
          });
          return [...updated, saved];
        });
        
        return saved;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add topic");
        throw err;
      }
    },
    [topics]
  );

  // Update topic's hot status
  const toggleHot = useCallback(async (id: string, isHot: boolean) => {
    try {
      await updateTopicHotStatus(id, isHot);
      setTopics((prev) =>
        prev.map((t) => (t.id === id ? { ...t, isHot } : t))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update topic");
      throw err;
    }
  }, []);

  // Mark topic as complete
  const markComplete = useCallback(async (id: string) => {
    try {
      await completeTopic(id);
      setTopics((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                isCompleted: true,
                isHot: false,
                completedAt: new Date().toISOString(),
              }
            : t
        )
      );
      // Reload to get updated priorities
      await loadTopics();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to complete topic");
      throw err;
    }
  }, []);

  // Unarchive a topic (restore to original tab)
  const unarchiveTopic = useCallback(async (id: string) => {
    try {
      const topic = topics.find((t) => t.id === id);
      if (!topic) return;

      // Calculate next priority for this type
      const sameTypeTopics = topics.filter(
        (t) => t.type === topic.type && !t.isCompleted
      );
      const nextPriority = sameTypeTopics.length + 1;

      const restoredTopic: Topic = {
        ...topic,
        isCompleted: false,
        completedAt: undefined,
        priority: nextPriority,
      };

      const saved = await saveTopic(restoredTopic);
      setTopics((prev) =>
        prev.map((t) => (t.id === saved.id ? saved : t))
      );
      return saved;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to unarchive topic");
      throw err;
    }
  }, [topics]);

  // Delete a topic
  const removeTopic = useCallback(async (id: string) => {
    try {
      await deleteTopic(id);
      setTopics((prev) => prev.filter((t) => t.id !== id));
      // Reload to get updated priorities
      await loadTopics();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete topic");
      throw err;
    }
  }, []);

  // Update a topic (for editing)
  const updateTopic = useCallback(async (updatedTopic: Topic) => {
    try {
      const originalTopic = topics.find((t) => t.id === updatedTopic.id);
      if (!originalTopic) {
        throw new Error("Topic not found");
      }

      const oldPriority = originalTopic.priority;
      const newPriority = updatedTopic.priority;

      // If priority changed, we need to shift other topics
      if (oldPriority !== newPriority) {
        const sameTypeTopics = topics.filter(
          (t) => t.type === updatedTopic.type && !t.isCompleted && t.id !== updatedTopic.id
        );

        let topicsToUpdate: Topic[] = [];

        if (newPriority < oldPriority) {
          // Moving up (lower number = higher priority)
          // Shift topics between newPriority and oldPriority-1 down by 1
          topicsToUpdate = sameTypeTopics
            .filter((t) => t.priority >= newPriority && t.priority < oldPriority)
            .map((t) => ({ ...t, priority: t.priority + 1 }));
        } else {
          // Moving down (higher number = lower priority)
          // Shift topics between oldPriority+1 and newPriority up by 1
          topicsToUpdate = sameTypeTopics
            .filter((t) => t.priority > oldPriority && t.priority <= newPriority)
            .map((t) => ({ ...t, priority: t.priority - 1 }));
        }

        // Save shifted topics
        for (const t of topicsToUpdate) {
          await saveTopic(t);
        }

        // Save the updated topic
        const saved = await saveTopic(updatedTopic);

        // Update local state with all changes
        setTopics((prev) =>
          prev.map((t) => {
            if (t.id === saved.id) return saved;
            const shifted = topicsToUpdate.find((u) => u.id === t.id);
            return shifted || t;
          })
        );

        return saved;
      } else {
        // No priority change, just save normally
        const saved = await saveTopic(updatedTopic);
        setTopics((prev) =>
          prev.map((t) => (t.id === saved.id ? saved : t))
        );
        return saved;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update topic");
      throw err;
    }
  }, [topics]);

  // Update topic results (final outcome)
  const updateResults = useCallback(async (id: string, results: string) => {
    try {
      const topic = topics.find((t) => t.id === id);
      if (!topic) return;

      const now = new Date().toISOString();
      const updatedTopic: Topic = {
        ...topic,
        results,
        lastActivityAt: now, // Reset staleness timer
      };

      const saved = await saveTopic(updatedTopic);
      setTopics((prev) =>
        prev.map((t) => (t.id === saved.id ? saved : t))
      );
      return saved;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update results");
      throw err;
    }
  }, [topics]);

  // Add a note to a topic
  const addNote = useCallback(async (id: string, content: string) => {
    try {
      const topic = topics.find((t) => t.id === id);
      if (!topic) return;

      const now = new Date().toISOString();
      const newNote: Note = {
        id: generateId(),
        content,
        createdAt: now,
      };

      const updatedTopic: Topic = {
        ...topic,
        notes: [...(topic.notes || []), newNote],
        lastActivityAt: now, // Reset staleness timer
      };

      const saved = await saveTopic(updatedTopic);
      setTopics((prev) =>
        prev.map((t) => (t.id === saved.id ? saved : t))
      );
      return saved;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add note");
      throw err;
    }
  }, [topics]);

  return {
    // Data
    topics,
    internalTopics,
    externalTopics,
    hotTopics,
    completedTopics,

    // State
    isLoading,
    error,

    // Actions
    addTopic,
    toggleHot,
    markComplete,
    unarchiveTopic,
    removeTopic,
    updateTopic,
    updateResults,
    addNote,
    refresh: loadTopics,
  };
}
