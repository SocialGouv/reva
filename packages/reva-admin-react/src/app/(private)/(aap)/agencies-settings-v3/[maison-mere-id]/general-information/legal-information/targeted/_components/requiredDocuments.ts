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
  administratorWasDifferent,
}: {
  blocks: BlockKey[];
  administratorIsDifferent: boolean;
  administratorWasDifferent: boolean;
}): DocumentKey[] => {
  const required: DocumentKey[] = [];

  if (blocks.some((block) => block !== "contact")) {
    required.push("attestationURSSAF");
  }

  // Retirer le délégataire rend le compte au dirigeant: son identité est alors
  // demandée, même si le bloc "dirigeant" n'a pas été coché.
  if (
    blocks.includes("manager") ||
    (blocks.includes("administrator") &&
      administratorWasDifferent &&
      !administratorIsDifferent)
  ) {
    required.push("justificatifIdentiteDirigeant");
  }

  if (blocks.includes("administrator") && administratorIsDifferent) {
    required.push("lettreDeDelegation", "justificatifIdentiteDelegataire");
  }

  return required;
};
