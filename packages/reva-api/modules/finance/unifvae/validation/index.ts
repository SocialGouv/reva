import { prismaClient } from "../../../../infra/database/postgres/client";
import { validateAccompagnement } from "./accompagnement";
import { validateComplementFormatif } from "./complement-formatif";
import { validateCoutsHoraires } from "./couts-horaires";
import { validateFeasibilityChecks } from "./feasibility-checks";
import { valideForfaitHeures } from "./forfait-heures";
import { validHoursCountAndCosts } from "./valid-numbers";

const applyBusinessValidationRules = async (
  input: FundingRequestUnifvaeInputCompleted
): Promise<BusinessRulesValidationError[]> => {
  // Feasibility checks are blocking
  const feasibilityErrors = await validateFeasibilityChecks(input);
  if (feasibilityErrors.length) {
    return feasibilityErrors;
  }
  // The following tests are only relevent when Feasibility.decision="ADMISSIBLE"
  let errors: Array<BusinessRulesValidationError> = [];
  const feasibility = await prismaClient.feasibility.findFirst({
    where: { candidacyId: input.candidacyId },
  });
  if (feasibility?.decision === "ADMISSIBLE") {
    errors = errors
      .concat(validHoursCountAndCosts(input))
      .concat(valideForfaitHeures(input))
      .concat(validateCoutsHoraires(input))
      .concat(validateComplementFormatif(input))
      .concat(validateAccompagnement(input));
  }
  return errors;
};

export default applyBusinessValidationRules;
