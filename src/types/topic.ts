// Topic types for SyncTrack

export type InternalTag = "BBweb" | "BBAutomation" | "BBAnalytics" | "Product" | "ALL";
export type ExternalTag = "Support" | "PS" | "OtherProduct" | "Product" | "Multiple" | "CloudOps";
export type TopicType = "internal" | "external";

export interface ADOWorkItem {
  id: number;
  url: string;
  title: string;
}

export interface Topic {
  id: string;
  description: string;
  priority: number; // 1 = highest, unique per tab
  type: TopicType;
  tags: (InternalTag | ExternalTag)[]; // Multiple tags supported
  adoWorkItem?: ADOWorkItem;
  results?: string; // Notes/results - required before marking complete
  resultsUpdatedAt?: string; // ISO date string - tracks when results were last updated
  isHot: boolean;
  isCompleted: boolean;
  completedAt?: string; // ISO date string for serialization
  createdAt: string; // ISO date string for serialization
}

// Staleness thresholds in hours
export const STALE_WARNING_HOURS = 48; // Yellow warning
export const STALE_CRITICAL_HOURS = 120; // Red critical

// Helper to determine staleness level
export type StalenessLevel = "none" | "warning" | "critical";

export function getStalenessLevel(topic: Topic): StalenessLevel {
  // Completed topics don't show staleness
  if (topic.isCompleted) return "none";
  
  // Use resultsUpdatedAt if available, otherwise fall back to createdAt
  const lastUpdate = topic.resultsUpdatedAt || topic.createdAt;
  const lastUpdateDate = new Date(lastUpdate);
  const now = new Date();
  const hoursSinceUpdate = (now.getTime() - lastUpdateDate.getTime()) / (1000 * 60 * 60);
  
  if (hoursSinceUpdate >= STALE_CRITICAL_HOURS) return "critical";
  if (hoursSinceUpdate >= STALE_WARNING_HOURS) return "warning";
  return "none";
}

export interface ADOConfig {
  organization: string;
  project: string;
  token: string; // PAT token
}

// Helper type guards
export function isInternalTag(tag: string): tag is InternalTag {
  return ["BBweb", "BBAutomation", "BBAnalytics", "Product", "ALL"].includes(tag);
}

export function isExternalTag(tag: string): tag is ExternalTag {
  return ["Support", "PS", "OtherProduct", "Product", "Multiple", "CloudOps"].includes(tag);
}

// Constants for tag options
export const INTERNAL_TAGS: InternalTag[] = [
  "BBweb",
  "BBAutomation",
  "BBAnalytics",
  "Product",
  "ALL",
];

export const EXTERNAL_TAGS: ExternalTag[] = [
  "Support",
  "PS",
  "OtherProduct",
  "Product",
  "Multiple",
  "CloudOps",
];
