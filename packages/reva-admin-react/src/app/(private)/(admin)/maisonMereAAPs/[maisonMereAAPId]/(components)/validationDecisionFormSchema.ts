import { z } from "zod";

import { sanitizedOptionalTextAllowSpecialCharacters } from "@/utils/input-sanitization";

export const validationDecisionFormSchema = z
  .object({
    decision: z.enum(["VALIDE", "DEMANDE_DE_PRECISION"], {
      invalid_type_error: "Veuillez sélectionner une décision",
    }),
    motiveKeys: z.array(z.string()).default([]),
    aapComment: sanitizedOptionalTextAllowSpecialCharacters(),
    internalComment: sanitizedOptionalTextAllowSpecialCharacters(),
  })
  .superRefine((data, ctx) => {
    if (
      data.decision === "DEMANDE_DE_PRECISION" &&
      !data.motiveKeys.length &&
      data.aapComment === ""
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Veuillez sélectionner au moins un motif de non-conformité ou renseigner un commentaire",
        path: ["aapComment"],
      });
    }
    return data;
  });

export type ValidationDecisionFormData = z.infer<
  typeof validationDecisionFormSchema
>;
