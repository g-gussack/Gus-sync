import { useState, useEffect, useCallback } from "react";
import type {
  Topic,
  TopicType,
  InternalTag,
  ExternalTag,
  ADOWorkItem,
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
      adoWorkItem?: ADOWorkItem
    ) => {
      try {
        // Calculate next priority for this type
        const sameTypeTopics = topics.filter(
          (t) => t.type === type && !t.isCompleted
        );
        const nextPriority = sameTypeTopics.length + 1;

        const newTopic: Topic = {
          id: generateId(),
          description,
          priority: nextPriority,
          type,
          tags,
          adoWorkItem,
          isHot: false,
          isCompleted: false,
          createdAt: new Date().toISOString(),
        };

        const saved = await saveTopic(newTopic);
        setTopics((prev) => [...prev, saved]);
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
      const saved = await saveTopic(updatedTopic);
      setTopics((prev) =>
        prev.map((t) => (t.id === saved.id ? saved : t))
      );
      return saved;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update topic");
      throw err;
    }
  }, []);

  // Update topic results/notes
  const updateResults = useCallback(async (id: string, results: string) => {
    try {
      const topic = topics.find((t) => t.id === id);
      if (!topic) return;

      const updatedTopic: Topic = {
        ...topic,
        results,
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
    refresh: loadTopics,
  };
}
