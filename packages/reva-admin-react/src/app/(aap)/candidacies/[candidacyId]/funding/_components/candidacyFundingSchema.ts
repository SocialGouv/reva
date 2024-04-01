import { z } from "zod";
import { GenderEnum } from "../../summary/candidate-information/_components/candidateCivilInformationSchema";

export const candidacyFundingSchema = z.object({
  candidateSecondname: z.string().optional(),
  candidateThirdname: z.string().optional(),
  candidateGender: z.nativeEnum(GenderEnum).default(GenderEnum.undisclosed),
  individualHourCount: z.number().optional(),
  individualCost: z.number().optional(),
  collectiveHourCount: z.number().optional(),
  collectiveCost: z.number().optional(),
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
