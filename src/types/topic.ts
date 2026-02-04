// Topic types for SyncTrack

export type InternalTag = "BBweb" | "BBAutomation" | "BBAnalytics" | "Product" | "ALL";
export type ExternalTag = "Support" | "PS" | "OtherProduct" | "Product" | "Multiple";
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
  isHot: boolean;
  isCompleted: boolean;
  completedAt?: string; // ISO date string for serialization
  createdAt: string; // ISO date string for serialization
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
  return ["Support", "PS", "OtherProduct", "Product", "Multiple"].includes(tag);
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
];
