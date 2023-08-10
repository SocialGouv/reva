// Dans tous les cas, que ce soit une certification totale ou certification par
// bloc de compétence, on souhaite limiter le coût horaire:
//
// Accompagnement individuel à maximum 70€ l’heure
// Accompagnement collectif à maximum 35€ l’heure
// Complément formatif à maximum 25€ l’heure

export const validateCoutsHoraires = (
  input: FundingRequestUnifvaeInput
): BusinessRulesValidationError[] => {
  const fundingRequest = input.fundingRequest;
  const errors: BusinessRulesValidationError[] = [];

  if (fundingRequest.individualCost > 70) {
    errors.push({
      fieldName: "individualCost",
      message:
        "Le coût de l'accompagnement individuel ne doit pas excéder 70€ l’heure",
    });
  }

  if (fundingRequest.collectiveCost > 35) {
    errors.push({
      fieldName: "collectiveCost",
      message:
        "Le coût de l'accompagnement collectif ne doit pas excéder 35€ l’heure",
    });
  }

  if (fundingRequest.mandatoryTrainingsCost > 25) {
    errors.push({
      fieldName: "mandatoryTrainingsCost",
      message: "Le coût du complément formatif ne doit pas excéder 25€ l’heure",
    });
  }
  if (fundingRequest.basicSkillsCost > 25) {
    errors.push({
      fieldName: "basicSkillsCost",
      message: "Le coût du complément formatif ne doit pas excéder 25€ l’heure",
    });
  }

  if (fundingRequest.certificateSkillsCost > 25) {
    errors.push({
      fieldName: "certificateSkillsCost",
      message: "Le coût du complément formatif ne doit pas excéder 25€ l’heure",
    });
  }
  if (fundingRequest.otherTrainingCost > 25) {
    errors.push({
      fieldName: "otherTrainingCost",
      message: "Le coût du complément formatif ne doit pas excéder 25€ l’heure",
    });
  }

  return errors;
};
