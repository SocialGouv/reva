// DESCRIPTION DES RÈGLES
// ----------------------
//
// Le cout total de la demande de financement et de paiement ne doit pas dépasser un certain montant hors forfait. Le //montant dépend est de 3200€ hors forfait pour la demande de financement et dépend de la date d'envoie de la demande de financement pour la demande de paiement (4700€ hors forfait si avant le 19/12/2023, 3200€ après)

import { Decimal } from "@prisma/client/runtime/library";

export const validateCoutTotal = ({
  maximumTotalCostAllowed,
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
  maximumTotalCostAllowed: Decimal;
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

  const total = individualHourCount
    .mul(individualCost)
    .plus(collectiveHourCount.mul(collectiveCost))
    .plus(basicSkillsHourCount.mul(basicSkillsCost))
    .plus(mandatoryTrainingsHourCount.mul(mandatoryTrainingsCost))
    .plus(certificateSkillsHourCount.mul(certificateSkillsCost))
    .plus(otherTrainingHourCount.mul(otherTrainingCost));

  if (total.greaterThan(maximumTotalCostAllowed)) {
    errors.push({
      fieldName: "GLOBAL",
      message: `Le coût total de la demande ne peut dépasser ${maximumTotalCostAllowed.toFixed(0)}€ hors forfait`,
    });
  }

  return errors;
};
