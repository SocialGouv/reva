// Make sure the numbers are realistic (positive, half-hours)
import { z } from "zod";

const hoursCountAndCostSchema = z.object({
  individualHourCount: z.number().nonnegative().multipleOf(0.5),
  individualCost: z.number().nonnegative(),
  collectiveHourCount: z.number().nonnegative().multipleOf(0.5),
  collectiveCost: z.number().nonnegative(),
  basicSkillsHourCount: z.number().nonnegative().multipleOf(0.5),
  basicSkillsCost: z.number().nonnegative(),
  mandatoryTrainingsHourCount: z.number().nonnegative().multipleOf(0.5),
  mandatoryTrainingsCost: z.number().nonnegative(),
  certificateSkillsHourCount: z.number().nonnegative().multipleOf(0.5),
  certificateSkillsCost: z.number().nonnegative(),
  otherTrainingHourCount: z.number().nonnegative().multipleOf(0.5),
  otherTrainingCost: z.number().nonnegative(),
});

export const validHoursCountAndCosts = (
  input: FundingRequestUnifvaeInput
): BusinessRulesValidationError[] => {
  const result = hoursCountAndCostSchema.safeParse(input.fundingRequest);
  if (!result.success) {
    return result.error.issues.map((issue) => ({
      fieldName: issueFieldNameToBusinessRulesValidationFieldname(
        issue.path[0]
      ),
      message: appError(issue.code),
    }));
  }
  return [];
};

function issueFieldNameToBusinessRulesValidationFieldname(
  input: string | number
): BusinessRulesValidationFieldname {
  if (typeof input === "number") {
    return input.toString() as BusinessRulesValidationFieldname;
  }
  return input as BusinessRulesValidationFieldname;
}

function appError(code: string) {
  switch (code) {
    case "not_multiple_of":
      return "Le décompte des heures doit être un multiple de 0,5";
    default:
      return "Format numérique incorrect.";
  }
}
