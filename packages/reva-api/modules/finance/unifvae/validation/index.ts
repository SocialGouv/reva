import { prismaClient } from "../../../../prisma/client";
import { validateAccompagnement } from "./accompagnement";
import { validateComplementFormatif } from "./complement-formatif";
import { validateCoutsHoraires } from "./couts-horaires";
import { validateFeasibilityChecks } from "./feasibility-checks";
import { valideForfaitHeures } from "./forfait-heures";
import { validHoursCountAndCosts } from "./valid-numbers";

export const applyBusinessValidationRules = async (
  input: {
    candidacyId: string;
    isCertificationPartial: boolean;
  } & FundingRequestUnifvaeHourFields &
    FundingRequestUnifvaeCostFields,
): Promise<BusinessRulesValidationError[]> => {
  // Feasibility checks are blocking
  const feasibilityErrors = await validateFeasibilityChecks({
    ...input,
  });
  if (feasibilityErrors.length) {
    return feasibilityErrors;
  }

  // The following tests are only relevent when Feasibility.decision="ADMISSIBLE"
  let errors: Array<BusinessRulesValidationError> = [];
  const feasibility = await prismaClient.feasibility.findFirst({
    where: { candidacyId: input.candidacyId, isActive: true },
  });

  if (feasibility?.decision === "ADMISSIBLE") {
    errors = errors
      .concat(validHoursCountAndCosts({ ...input }))
      .concat(valideForfaitHeures({ ...input }))
      .concat(validateCoutsHoraires({ ...input }))
      .concat(validateComplementFormatif({ ...input }))
      .concat(validateAccompagnement({ ...input }));
  }
  return errors;
};
