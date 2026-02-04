import { z } from "zod";

export const adoConfigInputSchema = z.object({
  organization: z.string().min(1),
  project: z.string().min(1),
  token: z.string().min(1),
});

export const searchWorkItemsInputSchema = z.object({
  query: z.string().min(1),
  organization: z.string().min(1),
  project: z.string().min(1),
  token: z.string().min(1),
});

export const getWorkItemInputSchema = z.object({
  id: z.number().int().positive(),
  organization: z.string().min(1),
  project: z.string().min(1),
  token: z.string().min(1),
});
