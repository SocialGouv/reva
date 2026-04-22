import { z } from "zod";

import { sanitizedTextAllowSpecialCharacters } from "@/utils/input-sanitization";

export const paymentRequestUniRevaInvoiceSchema = z.object({
  invoiceNumber: sanitizedTextAllowSpecialCharacters(),
  individualEffectiveHourCount: z.number().default(0),
  individualEffectiveCost: z.number().default(0),
  collectiveEffectiveHourCount: z.number().default(0),
  collectiveEffectiveCost: z.number().default(0),
  mandatoryTrainingsEffectiveHourCount: z.number().default(0),
  mandatoryTrainingsEffectiveCost: z.number().default(0),
  basicSkillsEffectiveHourCount: z.number().default(0),
  basicSkillsEffectiveCost: z.number().default(0),
  certificateSkillsEffectiveHourCount: z.number().default(0),
  certificateSkillsEffectiveCost: z.number().default(0),
  otherTrainingEffectiveHourCount: z.number().default(0),
  otherTrainingEffectiveCost: z.number().default(0),
  diagnosisEffectiveHourCount: z.number().default(0),
  diagnosisEffectiveCost: z.number().default(0),
  postExamEffectiveHourCount: z.number().default(0),
  postExamEffectiveCost: z.number().default(0),
  examEffectiveHourCount: z.number().default(0),
  examEffectiveCost: z.number().default(0),
});

export type PaymentRequestUniRevaInvoiceFormData = z.infer<
  typeof paymentRequestUniRevaInvoiceSchema
>;
