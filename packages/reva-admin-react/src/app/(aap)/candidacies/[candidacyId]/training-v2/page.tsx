"use client";
import { CandidacyBackButton } from "@/components/candidacy-back-button/CandidacyBackButton";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { isCandidacyStatusEqualOrAbove } from "@/utils/isCandidacyStatusEqualOrAbove";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useRouter } from "next/navigation";
import { TrainingForm, TrainingFormValues } from "./_components/TrainingForm";
import {
  OTHER_FINANCING_METHOD_ID,
  useTrainingPage,
} from "./trainingPage.hook";

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
  const {
    getCandidacyByIdWithReferentialStatus,
    candidacy,
    referential,
    submitTraining,
  } = useTrainingPage();

  const candidacyFinancingMethodIds =
    candidacy?.candidacyOnCandidacyFinancingMethods?.map(
      (c) => c.candidacyFinancingMethod.id,
    ) || [];

  const candidacyFinancingMethodOtherSourceText =
    candidacy?.candidacyOnCandidacyFinancingMethods?.find(
      (c) => c.candidacyFinancingMethod.id === OTHER_FINANCING_METHOD_ID,
    )?.additionalInformation;

  const router = useRouter();

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
      router.push(`/candidacies/${candidacy?.id}/summary`);
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
              {getTypologyLabel(candidacy.typology)}
              {candidacy.conventionCollective
                ? ` - ${candidacy.conventionCollective?.label}`
                : ""}
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
          {getCandidacyByIdWithReferentialStatus === "success" && (
            <TrainingForm
              showCertificationCompletionFields={
                candidacy.feasibilityFormat === "UPLOADED_PDF"
              }
              showCandidacyFinancingMethodFields={
                candidacy.financeModule === "hors_plateforme"
              }
              basicSkillsFromReferential={
                referential.basicSkillsFromReferential
              }
              trainingsFromReferential={referential.trainingsFromReferential}
              candidacyFinancingMethodsFromReferential={
                referential.candidacyFinancingMethodsFromReferential
              }
              defaultValues={{
                individualHourCount: candidacy.individualHourCount,
                collectiveHourCount: candidacy.collectiveHourCount,
                additionalHourCount: candidacy.additionalHourCount,
                mandatoryTrainingIds: candidacy.mandatoryTrainings.map(
                  (m) => m.id,
                ),
                basicSkillIds: candidacy.basicSkills.map((b) => b.id),
                certificateSkills: candidacy.certificateSkills,
                otherTraining: candidacy.otherTraining,
                certificationScope:
                  candidacy.isCertificationPartial !== null
                    ? candidacy.isCertificationPartial
                      ? "PARTIAL"
                      : "COMPLETE"
                    : null,
                candidacyFinancingMethodIds,
                candidacyFinancingMethodOtherSourceText,
              }}
              onSubmit={handleFormSubmit}
              disabled={isCandidacyStatusEqualOrAbove(
                candidacy.status || "ARCHIVE",
                "DOSSIER_FAISABILITE_ENVOYE",
              )}
            />
          )}
        </>
      )}
    </>
  );
};

export default TrainingPage;
