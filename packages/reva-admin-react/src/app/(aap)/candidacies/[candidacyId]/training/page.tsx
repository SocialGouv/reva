"use client";
import { CandidacyBackButton } from "@/components/candidacy-back-button/CandidacyBackButton";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { useTrainingPage } from "./trainingPage.hook";
import { Button } from "@codegouvfr/react-dsfr/Button";

const getTypologyLabel = (typology?: string) => {
  switch (typology) {
    case "SALARIE_PRIVE":
      return "Salarié du privé";
    case "DEMANDEUR_EMPLOI":
      return "Demandeur d'emploi";
    case "AIDANTS_FAMILIAUX":
      return "Aidant familial";
    case "BENEVOLE":
      return "Bénévole";
  }
  return typology;
};
const TrainingPage = () => {
  const { candidacy } = useTrainingPage();

  return (
    <>
      <CandidacyBackButton candidacyId={candidacy?.id as string} />
      <h1>Définition du parcours</h1>
      <FormOptionalFieldsDisclaimer />
      <hr />
      {candidacy && (
        <>
          <h2 className="text-xl">Typologie et convention collective</h2>
          <div className="flex items-start gap-4 mb-6">
            <span className="text-sm text-gray-500">
              {getTypologyLabel(candidacy.typology)} -{" "}
              {candidacy.conventionCollective?.label}
            </span>
            <Button
              priority="tertiary"
              className="ml-auto"
              size="small"
              iconId="fr-icon-edit-line"
              linkProps={{ href: `/candidacies/${candidacy.id}/typology` }}
            >
              Modifier
            </Button>
          </div>
          <hr />
        </>
      )}
    </>
  );
};

export default TrainingPage;
