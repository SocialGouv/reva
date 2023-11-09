// DESCRIPTION DES RÈGLES
// ----------------------
//
// Partie complément formatif, le total d’heures des différents champs, ne doit pas
// excéder 70 heures(ou 35 heures en certification par bloc), mais
// une ligne peut très bien être à 70 heures, et fatalement les autres seront à 0.

import { Decimal } from "@prisma/client/runtime";

export const validateComplementFormatif = (input: {
  mandatoryTrainingsHourCount: Decimal;
  basicSkillsHourCount: Decimal;
  certificateSkillsHourCount: Decimal;
  otherTrainingHourCount: Decimal;
}): BusinessRulesValidationError[] => {
  const complementHourFields = [
    "mandatoryTrainingsHourCount",
    "basicSkillsHourCount",
    "certificateSkillsHourCount",
    "otherTrainingHourCount",
  ] as const;

  const complementHoursSum = complementHourFields.reduce(
    (sum: Decimal, fieldName) =>
      input[fieldName] ? sum.plus(input[fieldName]) : sum,
    new Decimal(0)
  );

  if (complementHoursSum.greaterThan(70)) {
    return [
      {
        fieldName: "GLOBAL",
        message: "Les compléments formatifs ne peuvent excéder 70 heures",
      },
    ];
  }

  return [];
};
