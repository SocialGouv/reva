import { valideForfaitHeures } from "./forfait-heures";

const applyBusinessValidationRules = (
  input: FundingRequestUnifvaeInput
): BusinessRulesValidationError[] => valideForfaitHeures(input);

export default applyBusinessValidationRules;
