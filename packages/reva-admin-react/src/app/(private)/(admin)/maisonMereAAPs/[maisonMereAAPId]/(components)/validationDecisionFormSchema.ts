import { z } from "zod";

import { sanitizedOptionalTextAllowSpecialCharacters } from "@/utils/input-sanitization";

export const validationDecisionFormSchema = z
  .object({
    decision: z.enum(["VALIDE", "DEMANDE_DE_PRECISION"], {
      invalid_type_error: "Veuillez sélectionner une décision",
    }),
    aapComment: sanitizedOptionalTextAllowSpecialCharacters(),
    internalComment: sanitizedOptionalTextAllowSpecialCharacters(),
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

export type ValidationDecisionFormData = z.infer<
  typeof validationDecisionFormSchema
>;
