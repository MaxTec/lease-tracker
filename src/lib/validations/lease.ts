import { z } from "zod";
import { RuleCategory, ClauseType } from "@prisma/client";

export const ruleFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.nativeEnum(RuleCategory, {
    errorMap: () => ({ message: "Please select a valid category" }),
  }),
});

export const clauseFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  type: z.nativeEnum(ClauseType, {
    errorMap: () => ({ message: "Please select a valid type" }),
  }),
});

export type RuleFormData = z.infer<typeof ruleFormSchema>;
export type ClauseFormData = z.infer<typeof clauseFormSchema>; 