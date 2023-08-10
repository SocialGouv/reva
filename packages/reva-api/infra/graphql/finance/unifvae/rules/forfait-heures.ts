// On souhaite intégrer une règle sur le forfait, il pourra en exister deux versions :
//
// Une certification totale
// Une certification sur bloc de compétence (certification partielle, en fait)
// Qui sera établie au moment du choix, à l'étape 2 de la demande.
//
// Si certification totale :
//
// le champ Accompagnement Individuel est limité à 30 heures maximum
// le champ Accompagnement Collectif est limité à 20 heures maximum
// le champ Complément formatif est limité à 70 heures maximum
// Si certification sur bloc de compétence, on divise tout par 2 :
//
// le champ Accompagnement Individuel est limité à 15 heures maximum
// le champ Accompagnement Collectif est limité à 10 heures maximum
// le champ Complément formatif est limité à 35 heures maximum

export const valideForfaitHeures = (
  input: FundingRequestUnifvaeInput
): BusinessRulesValidationError[] => {
  const fundingRequest = input.fundingRequest;
  const errors: BusinessRulesValidationError[] = [];
  const certificationStatusName = fundingRequest.isPartialCertification
    ? "partielle"
    : "complète";
  const maxIndividualHours = fundingRequest.isPartialCertification ? 15 : 30;
  const maxCollectiveHours = fundingRequest.isPartialCertification ? 10 : 20;
  const maxComplementaryTrainingHours = fundingRequest.isPartialCertification
    ? 35
    : 70;

  if (fundingRequest.individualHourCount > maxIndividualHours) {
    errors.push({
      fieldName: "individualHourCount",
      message: `Pour une certification ${certificationStatusName} l'accompagnement individuel ne peut excéder ${maxIndividualHours} heures.`,
    });
  }

  if (fundingRequest.collectiveHourCount > maxCollectiveHours) {
    errors.push({
      fieldName: "collectiveHourCount",
      message: `Pour une certification ${certificationStatusName} l'accompagnement collectif ne peut excéder ${maxCollectiveHours} heures.`,
    });
  }

  const complementaryHourCount =
    fundingRequest.mandatoryTrainingsHourCount +
    fundingRequest.basicSkillsHourCount +
    fundingRequest.certificateSkillsHourCount +
    fundingRequest.otherTrainingHourCount;
  if (complementaryHourCount > maxComplementaryTrainingHours) {
    errors.push({
      fieldName: "mandatoryTrainingsHourCount",
      message: `Pour une certification ${certificationStatusName} le complément formatif ne peut excéder ${maxComplementaryTrainingHours} heures.`,
    });
    errors.push({
      fieldName: "basicSkillsHourCount",
      message: `Pour une certification ${certificationStatusName} le complément formatif ne peut excéder ${maxComplementaryTrainingHours} heures.`,
    });
    errors.push({
      fieldName: "certificateSkillsHourCount",
      message: `Pour une certification ${certificationStatusName} le complément formatif ne peut excéder ${maxComplementaryTrainingHours} heures.`,
    });
    errors.push({
      fieldName: "otherTrainingHourCount",
      message: `Pour une certification ${certificationStatusName} le complément formatif ne peut excéder ${maxComplementaryTrainingHours} heures.`,
    });
  }
  return errors;
};
