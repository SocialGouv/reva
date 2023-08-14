// Make sure the numbers are realistic (positive, half-hours)

import { Decimal } from "@prisma/client/runtime";

export const validHoursCountAndCosts = (input: FundingRequestUnifvaeInput) =>
  ([] as BusinessRulesValidationError[])
    .concat(validHours(input))
    .concat(validCosts(input));

const isPositiveOrUndefined = (d?: Decimal): boolean =>
  !d ? true : d.isPositive();
const isMultipleOfHalfOrUndefined = (d?: Decimal): boolean =>
  !d ? true : d.modulo(point5).eq(zero);

const hourFields: Array<keyof FundingRequestUnifvaeHourFields> = [
  "basicSkillsHourCount",
  "certificateSkillsHourCount",
  "collectiveHourCount",
  "individualHourCount",
  "mandatoryTrainingsHourCount",
  "otherTrainingHourCount",
];
const point5 = new Decimal(0.5);
const zero = new Decimal(0);

function validHours(
  input: FundingRequestUnifvaeInput
): BusinessRulesValidationError[] {
  return hourFields.reduce((errors, fieldName) => {
    if (!isPositiveOrUndefined(input.fundingRequest[fieldName])) {
      return [
        ...errors,
        {
          fieldName,
          message: "Le nombre d'heures doit être positif",
        },
      ];
    }
    if (!isMultipleOfHalfOrUndefined(input.fundingRequest[fieldName])) {
      return [
        ...errors,
        {
          fieldName,
          message: "Les heures doivent être un multiple de 0,5",
        },
      ];
    }
    return errors;
  }, [] as BusinessRulesValidationError[]);
}

const costFields: Array<keyof FundingRequestUnifvaeCostFields> = [
  "basicSkillsCost",
  "certificateSkillsCost",
  "collectiveCost",
  "individualCost",
  "mandatoryTrainingsCost",
  "otherTrainingCost",
];

function validCosts(
  input: FundingRequestUnifvaeInput
): BusinessRulesValidationError[] {
  return costFields.reduce((errors, fieldName) => {
    if (!isPositiveOrUndefined(input.fundingRequest[fieldName])) {
      return [
        ...errors,
        {
          fieldName,
          message: "Le coût horaire doit être positif",
        },
      ];
    }
    return errors;
  }, [] as BusinessRulesValidationError[]);
}
