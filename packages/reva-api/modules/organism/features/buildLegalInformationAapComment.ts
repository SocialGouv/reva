import { NonConformityMotive } from "../organism.types";

// Trace lisible de la décision: les messages générés dans l'ordre choisi par
// l'administrateur, puis son commentaire libre.
export const buildLegalInformationAapComment = ({
  nonConformityMotives,
  freeComment,
}: {
  nonConformityMotives: NonConformityMotive[];
  freeComment: string;
}) => {
  const generatedComment = nonConformityMotives.length
    ? [
        "Précisions à apporter :",
        ...nonConformityMotives.map(({ message }) => `- ${message}`),
      ].join("\n")
    : "";

  return [generatedComment, freeComment.trim()].filter(Boolean).join("\n\n");
};
