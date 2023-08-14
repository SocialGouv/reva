// DESCRIPTION DES RÈGLES
// ----------------------
//
// Partie complément formatif, le total d’heures des différents champs, ne doit pas
// excéder 70 heures(ou 35 heures en certification par bloc), mais
// une ligne peut très bien être à 70 heures, et fatalement les autres seront à 0.

import { Decimal } from "@prisma/client/runtime";

export const validateComplementFormatif = (
  input: FundingRequestUnifvaeInput
): BusinessRulesValidationError[] => {
  const complementHourFields: Array<keyof FundingRequestUnifvaeHourFields> = [
    "mandatoryTrainingsHourCount",
    "basicSkillsHourCount",
    "certificateSkillsHourCount",
    "otherTrainingHourCount",
  ];

  const complementHoursSum = complementHourFields.reduce(
    (a) => a, // TODO : do the math
    new Decimal(0)
  );

  if (complementHoursSum.greaterThan(70)) {
    return complementHourFields.map(
      (fieldName: keyof FundingRequestUnifvaeHourFields) => ({
        fieldName,
        message:
          "Le coût de l'accompagnement individuel ne doit pas excéder 70€ l’heure",
      })
    );
  }

  return [];
};
