import { GenderEnum } from "@/constants";
import { z } from "zod";

export const candidacyFundingSchema = z.object({
  candidateSecondname: z.string().optional(),
  candidateThirdname: z.string().optional(),
  candidateGender: z.nativeEnum(GenderEnum).default(GenderEnum.undisclosed),
  individualHourCount: z.number(),
  individualCost: z.number(),
  collectiveHourCount: z.number(),
  collectiveCost: z.number(),
  basicSkillsHourCount: z.number(),
  basicSkillsCost: z.number(),
  mandatoryTrainingsHourCount: z.number(),
  mandatoryTrainingsCost: z.number(),
  certificateSkillsHourCount: z.number(),
  certificateSkillsCost: z.number(),
  otherTrainingHourCount: z.number(),
  otherTrainingCost: z.number(),
  fundingContactFirstname: z.string().optional(),
  fundingContactLastname: z.string().optional(),
  fundingContactEmail: z.string().optional(),
  fundingContactPhone: z.string().optional(),
  confirmation: z.literal<boolean>(true),
});

export type CandidacyFundingFormData = z.infer<typeof candidacyFundingSchema>;
