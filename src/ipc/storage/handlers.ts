import { os } from "@orpc/server";
import Store from "electron-store";
import type { Topic, ADOConfig } from "@/types/topic";
import {
  saveTopicInputSchema,
  deleteTopicInputSchema,
  updateTopicPriorityInputSchema,
  updateTopicHotStatusInputSchema,
  completeTopicInputSchema,
  setAdoConfigInputSchema,
} from "./schemas";

// Store type
type StoreType = {
  topics: Record<string, Topic>;
  adoConfig: ADOConfig | null;
};

// Initialize electron-store with error handling for corrupted data
let store: Store<StoreType>;

try {
  store = new Store<StoreType>({
    defaults: {
      topics: {},
      adoConfig: null,
    },
    // Don't use encryption - it can cause corruption issues
  });
  
  // Test if we can read from the store
  store.get("topics");
  console.log("[Storage] Store initialized successfully");
} catch (error) {
  console.error("[Storage] Store corrupted, clearing and reinitializing:", error);
  
  // Create store without trying to read corrupted data
  store = new Store<StoreType>({
    defaults: {
      topics: {},
      adoConfig: null,
    },
  });
  
  // Clear the corrupted store
  store.clear();
  console.log("[Storage] Store cleared and reinitialized");
}

// Topic handlers
export const getTopics = os.handler(() => {
  const topics = store.get("topics", {});
  return Object.values(topics);
});

export const saveTopic = os.input(saveTopicInputSchema).handler(({ input }) => {
  const topics = store.get("topics", {});
  topics[input.id] = input as Topic;
  store.set("topics", topics);
  return input as Topic;
});

export const deleteTopic = os
  .input(deleteTopicInputSchema)
  .handler(({ input }) => {
    const topics = store.get("topics", {});
    const topic = topics[input.id];
    if (topic) {
      delete topics[input.id];
      store.set("topics", topics);

      // Reorder priorities for the same type
      const sameTopic = Object.values(topics).filter(
        (t) => t.type === topic.type && !t.isCompleted
      );
      sameTopic.sort((a, b) => a.priority - b.priority);
      sameTopic.forEach((t, index) => {
        t.priority = index + 1;
        topics[t.id] = t;
      });
      store.set("topics", topics);
    }
    return { success: true };
  });

export const updateTopicPriority = os
  .input(updateTopicPriorityInputSchema)
  .handler(({ input }) => {
    const topics = store.get("topics", {});
    const topic = topics[input.id];
    if (topic) {
      const oldPriority = topic.priority;
      const newPriority = input.priority;

      // Get all topics of the same type that are not completed
      const sameTypeTopics = Object.values(topics).filter(
        (t) => t.type === topic.type && !t.isCompleted && t.id !== input.id
      );

      // Adjust priorities of other topics
      sameTypeTopics.forEach((t) => {
        if (oldPriority < newPriority) {
          // Moving down: shift topics between old and new position up
          if (t.priority > oldPriority && t.priority <= newPriority) {
            t.priority -= 1;
            topics[t.id] = t;
          }
        } else {
          // Moving up: shift topics between new and old position down
          if (t.priority >= newPriority && t.priority < oldPriority) {
            t.priority += 1;
            topics[t.id] = t;
          }
        }
      });

      topic.priority = newPriority;
      topics[input.id] = topic;
      store.set("topics", topics);
    }
    return { success: true };
  });

export const updateTopicHotStatus = os
  .input(updateTopicHotStatusInputSchema)
  .handler(({ input }) => {
    const topics = store.get("topics", {});
    const topic = topics[input.id];
    if (topic) {
      topic.isHot = input.isHot;
      topics[input.id] = topic;
      store.set("topics", topics);
    }
    return { success: true };
  });

export const completeTopic = os
  .input(completeTopicInputSchema)
  .handler(({ input }) => {
    const topics = store.get("topics", {});
    const topic = topics[input.id];
    if (topic) {
      const oldPriority = topic.priority;
      topic.isCompleted = true;
      topic.completedAt = new Date().toISOString();
      topic.isHot = false; // Remove from hot when completed
      topics[input.id] = topic;

      // Reorder priorities for remaining topics of the same type
      const sameTypeTopics = Object.values(topics).filter(
        (t) => t.type === topic.type && !t.isCompleted
      );
      sameTypeTopics.forEach((t) => {
        if (t.priority > oldPriority) {
          t.priority -= 1;
          topics[t.id] = t;
        }
      });

      store.set("topics", topics);
    }
    return { success: true };
  });

// Helper to clean ADO config inputs
function cleanAdoConfig(config: ADOConfig): ADOConfig {
  const cleanOrg = config.organization.trim()
    .replace(/^https?:\/\//, "")
    .replace(/^dev\.azure\.com\//, "")
    .replace(/\.visualstudio\.com.*$/, "")
    .replace(/\/$/, "")
    .split("/")[0];
  
  const cleanProject = config.project.trim().replace(/\/$/, "");
  const cleanToken = config.token.trim();
  
  return {
    organization: cleanOrg,
    project: cleanProject,
    token: cleanToken,
  };
}

// ADO Config handlers
export const getAdoConfig = os.handler(() => {
  return store.get("adoConfig", null);
});

export const setAdoConfig = os
  .input(setAdoConfigInputSchema)
  .handler(({ input }) => {
    // Clean the config before storing
    const cleanedConfig = cleanAdoConfig(input as ADOConfig);
    console.log("[Storage] Saving cleaned ADO config:", {
      organization: cleanedConfig.organization,
      project: cleanedConfig.project,
      tokenLength: cleanedConfig.token.length,
    });
    store.set("adoConfig", cleanedConfig);
    return cleanedConfig;
  });

export const clearAdoConfig = os.handler(() => {
  store.set("adoConfig", null);
  return { success: true };
});
