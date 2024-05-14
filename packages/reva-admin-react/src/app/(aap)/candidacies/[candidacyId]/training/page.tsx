"use client";
import { CandidacyBackButton } from "@/components/candidacy-back-button/CandidacyBackButton";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { useTrainingPage } from "./trainingPage.hook";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { TrainingForm, TrainingFormValues } from "./_components/TrainingForm";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { isCandidacyStatusEqualOrAbove } from "@/utils/isCandidacyStatusEqualOrAbove";

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
  const { candidacy, submitTraining } = useTrainingPage();

  const handleFormSubmit = async (values: TrainingFormValues) => {
    try {
      const { certificationScope, ...rest } = values;
      await submitTraining.mutateAsync({
        candidacyId: candidacy?.id,
        training: {
          ...rest,
          isCertificationPartial: certificationScope === "PARTIAL",
        },
      });
      successToast("Le parcours personnalisé a bien été envoyé.");
    } catch (e) {
      graphqlErrorToast(e);
    }
  };

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
          <TrainingForm
            defaultValues={{
              individualHourCount: candidacy.individualHourCount,
              collectiveHourCount: candidacy.collectiveHourCount,
              additionalHourCount: candidacy.additionalHourCount,
              mandatoryTrainingIds: candidacy.mandatoryTrainingIds,
              basicSkillIds: candidacy.basicSkillIds,
              certificateSkills: candidacy.certificateSkills,
              otherTraining: candidacy.otherTraining,
              certificationScope:
                candidacy.isCertificationPartial !== null
                  ? candidacy.isCertificationPartial
                    ? "PARTIAL"
                    : "COMPLETE"
                  : null,
            }}
            onSubmit={handleFormSubmit}
            disabled={isCandidacyStatusEqualOrAbove(
              candidacy.candidacyStatuses.find((s) => s.isActive)?.status ||
                "ARCHIVE",
              "DOSSIER_FAISABILITE_ENVOYE",
            )}
          />
        </>
      )}
    </>
  );
};

export default TrainingPage;
