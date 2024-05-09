import { z } from "zod";

export const validationDecisionFormSchema = z
.object({
  decision: z.enum(["VALIDE", "DEMANDE_DE_PRECISION"]),
  aapComment: z.string().optional(),
  internalComment: z.string().optional(),
})
.superRefine((data, ctx) => {
  if (data.decision === "DEMANDE_DE_PRECISION" && data.aapComment === "") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "Veuillez renseigner un commentaire lorsque vous demandez des précisions",
        path: ["aapComment"],
    });
  }
  return data;
});

export type ValidationDecisionFormData = z.infer<typeof validationDecisionFormSchema>;