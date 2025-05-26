"use client";

import { Tabs } from "@codegouvfr/react-dsfr/Tabs";

import { useJuryPageLogic } from "./juryPageLogic";

import { DateDeJury } from "./DateDeJury";
import { Resultat } from "./Resultat";
import { BackButton } from "@/components/back-button/BackButton";

interface Props {
  params: {
    candidacyId: string;
    juryId?: string[];
  };
}

const JuryPage = (_props: Props) => {
  const { getCandidacy } = useJuryPageLogic();

  const candidacy = getCandidacy.data?.getCandidacyById;
  const dossierDeValidation = candidacy?.activeDossierDeValidation;

  return (
    <div className="flex flex-col w-full">
      <BackButton href="/candidacies/juries">Tous les dossiers</BackButton>
      <h1>Jury</h1>

      {!getCandidacy.isLoading &&
        dossierDeValidation?.decision == "PENDING" && (
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
