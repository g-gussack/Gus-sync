import { ipc } from "@/ipc/manager";
import type { Topic, ADOConfig } from "@/types/topic";

// Topic actions
export async function getTopics(): Promise<Topic[]> {
  return await ipc.client.storage.getTopics();
}

export async function saveTopic(topic: Topic): Promise<Topic> {
  return await ipc.client.storage.saveTopic(topic);
}

export async function deleteTopic(id: string): Promise<{ success: boolean }> {
  return await ipc.client.storage.deleteTopic({ id });
}

export async function updateTopicPriority(
  id: string,
  priority: number
): Promise<{ success: boolean }> {
  return await ipc.client.storage.updateTopicPriority({ id, priority });
}

export async function updateTopicHotStatus(
  id: string,
  isHot: boolean
): Promise<{ success: boolean }> {
  return await ipc.client.storage.updateTopicHotStatus({ id, isHot });
}

export async function completeTopic(id: string): Promise<{ success: boolean }> {
  return await ipc.client.storage.completeTopic({ id });
}

// ADO Config actions
export async function getAdoConfig(): Promise<ADOConfig | null> {
  return await ipc.client.storage.getAdoConfig();
}

export async function setAdoConfig(config: ADOConfig): Promise<ADOConfig> {
  return await ipc.client.storage.setAdoConfig(config);
}

export async function clearAdoConfig(): Promise<{ success: boolean }> {
  return await ipc.client.storage.clearAdoConfig();
}
