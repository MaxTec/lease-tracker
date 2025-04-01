import { z } from "zod";
import { RuleCategory } from "@prisma/client";

export const createRuleSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters long")
    .max(100, "Title must not exceed 100 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters long")
    .max(1000, "Description must not exceed 1000 characters"),
  category: z.nativeEnum(RuleCategory, {
    errorMap: () => ({ message: "Please select a valid category" }),
  }),
});

export const updateRulesOrderSchema = z.object({
  rules: z
    .array(
      z.object({
        id: z.string().uuid("Invalid rule ID format"),
      })
    )
    .min(1, "At least one rule is required"),
});

export type CreateRuleInput = z.infer<typeof createRuleSchema>;
export type UpdateRulesOrderInput = z.infer<typeof updateRulesOrderSchema>;
