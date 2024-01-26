// Make sure the numbers are realistic (positive, half-hours)

import { Decimal } from "@prisma/client/runtime/library";

const hourFields = [
  "basicSkillsHourCount",
  "certificateSkillsHourCount",
  "collectiveHourCount",
  "individualHourCount",
  "mandatoryTrainingsHourCount",
  "otherTrainingHourCount",
] as const;

const costFields = [
  "basicSkillsCost",
  "certificateSkillsCost",
  "collectiveCost",
  "individualCost",
  "mandatoryTrainingsCost",
  "otherTrainingCost",
] as const;

type HourFields = { [Key in (typeof hourFields)[number]]: Decimal };
type CostFields = { [Key in (typeof costFields)[number]]: Decimal };

export const validHoursCountAndCosts = (input: CostFields & HourFields) =>
  ([] as BusinessRulesValidationError[])
    .concat(validHours(input))
    .concat(validCosts(input));

const isPositiveOrUndefined = (d?: Decimal): boolean =>
  !d ? true : d.isPositive();
const isMultipleOfHalfOrUndefined = (d?: Decimal): boolean =>
  !d ? true : d.modulo(point5).eq(zero);

const point5 = new Decimal(0.5);
const zero = new Decimal(0);

function validHours(input: HourFields): BusinessRulesValidationError[] {
  return hourFields.reduce((errors, fieldName) => {
    if (!isPositiveOrUndefined(input[fieldName])) {
      return [
        ...errors,
        {
          fieldName,
          message: "Le nombre d'heures doit être positif",
        },
      ];
    }
    if (!isMultipleOfHalfOrUndefined(input[fieldName])) {
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

function validCosts(input: CostFields): BusinessRulesValidationError[] {
  return costFields.reduce((errors, fieldName) => {
    if (!isPositiveOrUndefined(input[fieldName])) {
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
