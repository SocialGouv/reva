// DESCRIPTION DES RÈGLES
// ----------------------
//
// - Si le dossier de faisabilité n'est pas envoyé, impossible de créer une demande de prise en charge.
// - Si la recevabilité n'est pas prononcée, impossible de créer une demande de prise en charge.
// - Si la recevabilité est négative, seul le forfait peut être pris en charge.

import { Decimal } from "@prisma/client/runtime";

import { prismaClient } from "../../../../infra/database/postgres/client";

export const validateFeasibilityChecks = async (
  input: FundingRequestUnifvaeInput
): Promise<BusinessRulesValidationError[]> => {
  const candidacy = await prismaClient.candidacy.findUnique({
    where: { id: input.candidacyId },
    include: {
      Feasibility: true,
      candidacyStatuses: true,
    },
  });

  // Vérirife qu'on a envoyé un dossier de faisabilité
  if (!candidacy?.Feasibility) {
    return [
      {
        fieldName: "GLOBAL",
        message:
          "Impossible de créer une demande de prise en charge car le dossier de faisabilité n'a pas été envoyé.",
      },
    ];
  }

  // Vérirife que la recevabilité a été prononcée
  if (candidacy?.Feasibility?.decision === "PENDING") {
    return [
      {
        fieldName: "GLOBAL",
        message:
          "Impossible de créer une demande de prise en charge car la recevabilité n'a pas été prononcée.",
      },
    ];
  }

  let errors: BusinessRulesValidationError[] = [];

  // Vérifie qu'on n'a aucun coût hors-forfait si dossier non validé
  if (candidacy.Feasibility?.decision === "REJECTED") {
    const hourFields: Array<keyof FundingRequestUnifvaeHourFields> = [
      "individualHourCount",
      "collectiveHourCount",
      "mandatoryTrainingsHourCount",
      "basicSkillsHourCount",
      "certificateSkillsHourCount",
      "otherTrainingHourCount",
    ];
    const zero = new Decimal(0);
    errors = errors.concat(
      hourFields
        .filter((hf) => input.fundingRequest[hf].greaterThan(zero))
        .map((fieldName) => ({
          fieldName,
          message: `Impossible de prendre en charge "${fieldName}" sur un dossier non recevable.`,
        }))
    );
  }

  return errors;
};
