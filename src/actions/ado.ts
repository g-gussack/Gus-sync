import { ipc } from "@/ipc/manager";
import type { ADOConfig, ADOWorkItem } from "@/types/topic";

export interface ADOTestResult {
  success: boolean;
  message: string;
}

export interface ADOSearchResult {
  workItems: Array<{
    id: number;
    title: string;
    state: string;
    url: string;
  }>;
  error?: string;
}

export interface ADOWorkItemResult {
  success: boolean;
  workItem?: {
    id: number;
    title: string;
    state: string;
    url: string;
  };
  error?: string;
}

export async function testAdoConnection(config: ADOConfig): Promise<ADOTestResult> {
  return await ipc.client.ado.testConnection(config);
}

export async function searchAdoWorkItems(
  query: string,
  config: ADOConfig
): Promise<ADOSearchResult> {
  return await ipc.client.ado.searchWorkItems({
    query,
    organization: config.organization,
    project: config.project,
    token: config.token,
  });
}

export async function getAdoWorkItem(
  id: number,
  config: ADOConfig
): Promise<ADOWorkItemResult> {
  return await ipc.client.ado.getWorkItem({
    id,
    organization: config.organization,
    project: config.project,
    token: config.token,
  });
}

// Helper to convert ADO API result to our ADOWorkItem type
export function toAdoWorkItem(
  result: ADOWorkItemResult
): ADOWorkItem | undefined {
  if (!result.success || !result.workItem) {
    return undefined;
  }
  return {
    id: result.workItem.id,
    url: result.workItem.url,
    title: result.workItem.title,
  };
}
