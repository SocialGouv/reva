// DESCRIPTION DES RÈGLES
// ----------------------
//
// Dans le parcours personnalisé, pour l’accompagnement individuel et l’accompagnement collectif :
// l'une ou l'autre des lignes est obligatoire mais pas les deux.
//
// C’est-à-dire que, lorsque l'un des champs de l'une des lignes est rempli,
// alors les deux champs de l'autre ligne non remplie deviennent (optionnel).
//
// Sachant que 0 n’est pas une valeur valable.

import { Decimal } from "@prisma/client/runtime";

export const validateAccompagnement = (input: FundingRequestUnifvaeInput) => {
  const errors = [] as BusinessRulesValidationError[];
  const individualHourCount =
    input.fundingRequest.individualHourCount ?? new Decimal(0);
  const collectiveHourCount =
    input.fundingRequest.collectiveHourCount ?? new Decimal(0);
  const individualCost = input.fundingRequest.individualCost ?? new Decimal(0);
  const collectiveCost = input.fundingRequest.collectiveCost ?? new Decimal(0);

  const zero = new Decimal(0);

  if (!individualHourCount.equals(zero) && individualCost.equals(zero)) {
    errors.push({
      fieldName: "individualCost",
      message: "Le coût horaire ne peut être nul",
    });
  }

  if (!collectiveHourCount.equals(zero) && collectiveCost.equals(zero)) {
    errors.push({
      fieldName: "collectiveCost",
      message: "Le coût horaire ne peut être nul",
    });
  }

  if (individualHourCount.plus(collectiveHourCount).equals(zero)) {
    errors.push({
      fieldName: "GLOBAL",
      message:
        "Le parcours personnalisé doit contenir un accompagnement individuel ou collectif",
    });
  }

  return errors;
};
