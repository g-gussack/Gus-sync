import { z } from "zod";

// Topic schemas
const internalTagSchema = z.enum(["BBweb", "BBAutomation", "BBAnalytics", "Product", "ALL"]);
const externalTagSchema = z.enum(["Support", "PS", "OtherProduct", "Product", "Multiple"]);
const topicTypeSchema = z.enum(["internal", "external"]);

const adoWorkItemSchema = z.object({
  id: z.number(),
  url: z.string().url(),
  title: z.string(),
});

export const topicSchema = z.object({
  id: z.string(),
  description: z.string(),
  priority: z.number().int().positive(),
  type: topicTypeSchema,
  tags: z.array(z.union([internalTagSchema, externalTagSchema])).min(1),
  adoWorkItem: adoWorkItemSchema.optional(),
  results: z.string().optional(),
  isHot: z.boolean(),
  isCompleted: z.boolean(),
  completedAt: z.string().optional(),
  createdAt: z.string(),
});

export const saveTopicInputSchema = topicSchema;

export const deleteTopicInputSchema = z.object({
  id: z.string(),
});

export const updateTopicPriorityInputSchema = z.object({
  id: z.string(),
  priority: z.number().int().positive(),
});

export const updateTopicHotStatusInputSchema = z.object({
  id: z.string(),
  isHot: z.boolean(),
});

export const completeTopicInputSchema = z.object({
  id: z.string(),
});

// ADO Config schemas
export const adoConfigSchema = z.object({
  organization: z.string(),
  project: z.string(),
  token: z.string(),
});

export const setAdoConfigInputSchema = adoConfigSchema;
