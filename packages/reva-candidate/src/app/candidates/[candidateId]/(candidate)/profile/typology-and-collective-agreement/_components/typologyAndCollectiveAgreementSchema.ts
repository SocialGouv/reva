import { z } from "zod";

import { AVAILABLE_CANDIDATE_TYPOLOGIES } from "@/utils/candidateTypology.util";

export const typologyFormSchema = z.object({
  typology: z.enum(AVAILABLE_CANDIDATE_TYPOLOGIES),
  ccnId: z.string().optional(),
  additionalInformation: z.string().optional(),
});
export type TypologyFormData = z.infer<typeof typologyFormSchema>;
