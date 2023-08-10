import { validateCoutsHoraires } from "./couts-horaires";
import { valideForfaitHeures } from "./forfait-heures";

const applyBusinessValidationRules = (input: FundingRequestUnifvaeInput) =>
  ([] as BusinessRulesValidationError[])
    .concat(valideForfaitHeures(input))
    .concat(validateCoutsHoraires(input));
export default applyBusinessValidationRules;
