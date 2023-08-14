import { validateCoutsHoraires } from "./couts-horaires";
import { valideForfaitHeures } from "./forfait-heures";
import { validHoursCountAndCosts } from "./valid-numbers";

const applyBusinessValidationRules = (
  input: FundingRequestUnifvaeInputCompleted
) =>
  ([] as BusinessRulesValidationError[])
    .concat(validHoursCountAndCosts(input))
    .concat(valideForfaitHeures(input))
    .concat(validateCoutsHoraires(input));

export default applyBusinessValidationRules;
