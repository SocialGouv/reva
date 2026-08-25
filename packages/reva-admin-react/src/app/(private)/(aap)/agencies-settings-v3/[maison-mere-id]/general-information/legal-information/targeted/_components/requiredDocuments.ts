import { BlockKey } from "./BlockSelectionStep";

export type DocumentKey =
  | "attestationURSSAF"
  | "justificatifIdentiteDirigeant"
  | "lettreDeDelegation"
  | "justificatifIdentiteDelegataire";

// Pièces demandées à la saisie, d'après les blocs choisis. L'API refait le calcul
// sur les valeurs réellement modifiées: elle seule décide de ce qui est obligatoire.
export const getRequiredDocuments = ({
  blocks,
  administratorIsDifferent,
}: {
  blocks: BlockKey[];
  administratorIsDifferent: boolean;
}): DocumentKey[] => {
  const required: DocumentKey[] = [];

  if (blocks.some((block) => block !== "contact")) {
    required.push("attestationURSSAF");
  }

  if (blocks.includes("manager")) {
    required.push("justificatifIdentiteDirigeant");
  }

  if (blocks.includes("administrator") && administratorIsDifferent) {
    required.push("lettreDeDelegation", "justificatifIdentiteDelegataire");
  }

  return required;
};
