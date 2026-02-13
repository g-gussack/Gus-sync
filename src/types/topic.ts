// Topic types for SyncTrack

export type InternalTag = "BBweb" | "BBAutomation" | "BBAnalytics" | "Product" | "ALL";
export type ExternalTag = "Support" | "PS" | "OtherProduct" | "Product" | "Multiple" | "CloudOps";
export type TopicType = "internal" | "external";

export interface ADOWorkItem {
  id: number;
  url: string;
  title: string;
}

// Individual timestamped note entry
export interface Note {
  id: string;
  content: string;
  createdAt: string; // ISO date string
}

export interface Topic {
  id: string;
  description: string;
  priority: number; // 1 = highest, unique per tab
  type: TopicType;
  tags: (InternalTag | ExternalTag)[]; // Multiple tags supported
  adoWorkItem?: ADOWorkItem;
  notes?: Note[]; // Array of timestamped notes for tracking discussion evolution
  results?: string; // Final outcome - required before marking complete
  lastActivityAt?: string; // ISO date string - tracks last note/result update for staleness
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
  
  // Use lastActivityAt if available, otherwise fall back to createdAt
  const lastUpdate = topic.lastActivityAt || topic.createdAt;
  const lastUpdateDate = new Date(lastUpdate);
  const now = new Date();
  const hoursSinceUpdate = (now.getTime() - lastUpdateDate.getTime()) / (1000 * 60 * 60);
  
  if (hoursSinceUpdate >= STALE_CRITICAL_HOURS) return "critical";
  if (hoursSinceUpdate >= STALE_WARNING_HOURS) return "warning";
  return "none";
}

// Helper to format date for display
export function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
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
