// DESCRIPTION DES RÈGLES
// ----------------------
//
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

import { Decimal } from "@prisma/client/runtime";

export const valideForfaitHeures = ({
  individualHourCount,
  collectiveHourCount,
  mandatoryTrainingsHourCount,
  basicSkillsHourCount,
  certificateSkillsHourCount,
  otherTrainingHourCount,
  isCertificationPartial,
}: {
  individualHourCount: Decimal;
  collectiveHourCount: Decimal;
  mandatoryTrainingsHourCount: Decimal;
  basicSkillsHourCount: Decimal;
  certificateSkillsHourCount: Decimal;
  otherTrainingHourCount: Decimal;
  isCertificationPartial: boolean;
}): BusinessRulesValidationError[] => {
  const errors: BusinessRulesValidationError[] = [];
  const certificationStatusName = isCertificationPartial
    ? "partielle"
    : "complète";
  const maxIndividualHours = new Decimal(isCertificationPartial ? 15 : 30);
  const maxCollectiveHours = new Decimal(isCertificationPartial ? 10 : 20);
  const maxComplementaryTrainingHours = new Decimal(
    isCertificationPartial ? 35 : 70
  );

  individualHourCount = individualHourCount ?? new Decimal(0);
  collectiveHourCount = collectiveHourCount ?? new Decimal(0);
  mandatoryTrainingsHourCount = mandatoryTrainingsHourCount ?? new Decimal(0);
  basicSkillsHourCount = basicSkillsHourCount ?? new Decimal(0);
  certificateSkillsHourCount = certificateSkillsHourCount ?? new Decimal(0);
  otherTrainingHourCount = otherTrainingHourCount ?? new Decimal(0);

  if (individualHourCount.greaterThan(maxIndividualHours)) {
    errors.push({
      fieldName: "individualHourCount",
      message: `Pour une certification ${certificationStatusName} l'accompagnement individuel ne peut excéder ${maxIndividualHours} heures.`,
    });
  }

  if (collectiveHourCount.greaterThan(maxCollectiveHours)) {
    errors.push({
      fieldName: "collectiveHourCount",
      message: `Pour une certification ${certificationStatusName} l'accompagnement collectif ne peut excéder ${maxCollectiveHours} heures.`,
    });
  }

  const complementaryHourCount = mandatoryTrainingsHourCount
    .plus(basicSkillsHourCount)
    .plus(certificateSkillsHourCount)
    .plus(otherTrainingHourCount);

  if (complementaryHourCount.greaterThan(maxComplementaryTrainingHours)) {
    errors.push({
      fieldName: "GLOBAL",
      message: `Pour une certification ${certificationStatusName} le complément formatif ne peut excéder ${maxComplementaryTrainingHours} heures.`,
    });
  }
  return errors;
};
