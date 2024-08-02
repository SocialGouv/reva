// DESCRIPTION DES RÈGLES
// ----------------------
//
// Le cout total de la demande de financement ne doit pas dépasser 3500€ hors forfait (donc 3200€)

import { Decimal } from "@prisma/client/runtime/library";

export const validateCoutTotal = ({
  individualHourCount,
  collectiveHourCount,
  basicSkillsHourCount,
  mandatoryTrainingsHourCount,
  certificateSkillsHourCount,
  otherTrainingHourCount,
  individualCost,
  collectiveCost,
  basicSkillsCost,
  mandatoryTrainingsCost,
  certificateSkillsCost,
  otherTrainingCost,
}: {
  individualHourCount: Decimal;
  collectiveHourCount: Decimal;
  basicSkillsHourCount: Decimal;
  mandatoryTrainingsHourCount: Decimal;
  certificateSkillsHourCount: Decimal;
  otherTrainingHourCount: Decimal;
  individualCost: Decimal;
  collectiveCost: Decimal;
  basicSkillsCost: Decimal;
  mandatoryTrainingsCost: Decimal;
  certificateSkillsCost: Decimal;
  otherTrainingCost: Decimal;
}) => {
  const errors = [] as BusinessRulesValidationError[];

  const maximum = new Decimal(3200);

  const total = individualHourCount
    .mul(individualCost)
    .plus(collectiveHourCount.mul(collectiveCost))
    .plus(basicSkillsHourCount.mul(basicSkillsCost))
    .plus(mandatoryTrainingsHourCount.mul(mandatoryTrainingsCost))
    .plus(certificateSkillsHourCount.mul(certificateSkillsCost))
    .plus(otherTrainingHourCount.mul(otherTrainingCost));

  if (total.greaterThan(maximum)) {
    errors.push({
      fieldName: "GLOBAL",
      message: "Le coût total ne peut dépasser 3500€",
    });
  }

  return errors;
};
