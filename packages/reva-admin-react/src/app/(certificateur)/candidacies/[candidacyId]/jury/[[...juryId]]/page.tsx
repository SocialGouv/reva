"use client";

import { Tabs } from "@codegouvfr/react-dsfr/Tabs";

import { BackButton } from "@/components/back-button/BackButton";
import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";

import { DateDeJury } from "./DateDeJury";
import { useJuryPageLogic } from "./juryPageLogic";
import { Resultat } from "./Resultat";

const JuryPage = () => {
  const { getCandidacy } = useJuryPageLogic();
  const { isFeatureActive } = useFeatureflipping();
  const isCertificateurCandidaciesAnnuaireEnabled = isFeatureActive(
    "CERTIFICATEUR_CANDIDACIES_ANNUAIRE",
  );

  const candidaciesUrl = isCertificateurCandidaciesAnnuaireEnabled
    ? "/candidacies/annuaire"
    : "/candidacies/juries";

  const candidacy = getCandidacy.data?.getCandidacyById;
  const dossierDeValidation = candidacy?.activeDossierDeValidation;

  return (
    <div className="flex flex-col w-full">
      <BackButton href={candidaciesUrl}>Tous les dossiers</BackButton>
      <h1>Jury</h1>

      {!getCandidacy.isLoading &&
        (dossierDeValidation?.decision == "PENDING" ||
          dossierDeValidation?.decision == "COMPLETE") && (
          <Tabs
            tabs={[
              {
                label: "Date de jury",
                isDefault: true,
                content: <DateDeJury />,
              },
              {
                label: "Résultat",
                content: <Resultat />,
              },
            ]}
          />
        )}

      {!getCandidacy.isLoading &&
        (!dossierDeValidation ||
          dossierDeValidation.decision == "INCOMPLETE") && (
          <div className="flex flex-col">
            <p className="text-gray-600">
              Le dossier de validation est en cours de rédaction. Il vous sera
              transmis par le candidat ou son Architecte Accompagnateur de
              Parcours afin que vous puissiez programmer son passage devant le
              jury.
            </p>
          </div>
        )}
    </div>
  );
};

export default JuryPage;
