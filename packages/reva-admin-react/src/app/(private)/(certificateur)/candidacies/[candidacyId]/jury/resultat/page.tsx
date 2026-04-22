"use client";
import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";

import { useJuryResultPageLogic } from "./juryResultPageLogic";
import { Resultat } from "./Resultat";
import { ResultatByBlocks } from "./ResultatByBlocks";

export default function ResultatPage() {
  const { getCandidacy } = useJuryResultPageLogic();
  const { isFeatureActive } = useFeatureflipping();
  const isJuryResultsByBlockFeatureActive = isFeatureActive(
    "JURY_RESULTS_BY_BLOCK",
  );

  const candidacy = getCandidacy.data?.getCandidacyById;
  const dossierDeValidation = candidacy?.activeDossierDeValidation;

  if (
    !getCandidacy.isLoading &&
    (!dossierDeValidation || dossierDeValidation.decision == "INCOMPLETE")
  ) {
    return (
      <div>
        Le dossier de validation est en cours de rédaction. Il vous sera
        transmis par le candidat ou son Architecte Accompagnateur de Parcours
        afin que vous puissiez programmer son passage devant le jury.
      </div>
    );
  }

  return candidacy?.typeAccompagnement === "ACCOMPAGNE" &&
    isJuryResultsByBlockFeatureActive ? (
    <ResultatByBlocks />
  ) : (
    <Resultat />
  );
}
