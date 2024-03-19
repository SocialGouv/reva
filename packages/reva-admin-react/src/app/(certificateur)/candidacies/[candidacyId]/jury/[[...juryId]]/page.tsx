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

  const candidacyStatuses =
    getCandidacy.data?.getCandidacyById?.candidacyStatuses;

  const isDossierDeValidationSent =
    candidacyStatuses?.findIndex(
      ({ status }) => status == "DOSSIER_DE_VALIDATION_ENVOYE",
    ) != -1;

  return (
    <div className="flex flex-col w-full">
      <BackButton href="/candidacies/juries">Tous les dossiers</BackButton>
      <h1>Jury</h1>

      {!getCandidacy.isLoading && isDossierDeValidationSent && (
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

      {!getCandidacy.isLoading && !isDossierDeValidationSent && (
        <div className="flex flex-col">
          <p className="text-gray-600">
            Veuillez envoyer le dossier de validation afin d'accéder à la
            section jury.
          </p>
        </div>
      )}
    </div>
  );
};

export default JuryPage;
