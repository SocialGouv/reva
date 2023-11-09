// DESCRIPTION DES RÈGLES
// ----------------------
//
// Dans tous les cas, que ce soit une certification totale ou certification par
// bloc de compétence, on souhaite limiter le coût horaire:
//
// Accompagnement individuel à maximum 70€ l’heure
// Accompagnement collectif à maximum 35€ l’heure
// Complément formatif à maximum 25€ l’heure

import { Decimal } from "@prisma/client/runtime";

export const validateCoutsHoraires = ({
  individualCost,
  collectiveCost,
  mandatoryTrainingsCost,
  basicSkillsCost,
  certificateSkillsCost,
  otherTrainingCost,
}: {
  individualCost: Decimal;
  collectiveCost: Decimal;
  mandatoryTrainingsCost: Decimal;
  basicSkillsCost: Decimal;
  certificateSkillsCost: Decimal;
  otherTrainingCost: Decimal;
}): BusinessRulesValidationError[] => {
  const errors: BusinessRulesValidationError[] = [];

  if (individualCost.greaterThan(70)) {
    errors.push({
      fieldName: "individualCost",
      message:
        "Le coût de l'accompagnement individuel ne doit pas excéder 70€ l’heure",
    });
  }

  if (collectiveCost.greaterThan(35)) {
    errors.push({
      fieldName: "collectiveCost",
      message:
        "Le coût de l'accompagnement collectif ne doit pas excéder 35€ l’heure",
    });
  }

  if (mandatoryTrainingsCost.greaterThan(25)) {
    errors.push({
      fieldName: "mandatoryTrainingsCost",
      message: "Le coût du complément formatif ne doit pas excéder 25€ l’heure",
    });
  }
  if (basicSkillsCost.greaterThan(25)) {
    errors.push({
      fieldName: "basicSkillsCost",
      message: "Le coût du complément formatif ne doit pas excéder 25€ l’heure",
    });
  }

  if (certificateSkillsCost.greaterThan(25)) {
    errors.push({
      fieldName: "certificateSkillsCost",
      message: "Le coût du complément formatif ne doit pas excéder 25€ l’heure",
    });
  }
  if (otherTrainingCost.greaterThan(25)) {
    errors.push({
      fieldName: "otherTrainingCost",
      message: "Le coût du complément formatif ne doit pas excéder 25€ l’heure",
    });
  }

  return errors;
};
