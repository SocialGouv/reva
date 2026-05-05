"use client";

import { Button } from "@codegouvfr/react-dsfr/Button";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useRouter } from "next/navigation";
import { useRef } from "react";

import { CandidacyBackButton } from "@/components/candidacy-back-button/CandidacyBackButton";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { getTypologyLabel } from "@/utils/candidateTypology.util";
import { isCandidacyStatusEqualOrAbove } from "@/utils/isCandidacyStatusEqualOrAbove";

import { TrainingForm, TrainingFormValues } from "./_components/TrainingForm";
import {
  OTHER_FINANCING_METHOD_ID,
  useTrainingPage,
} from "./trainingPage.hook";

const feasibilityResetWarningModal = createModal({
  id: "feasibility-reset-training-warning",
  isOpenedByDefault: false,
});

const FeasibilityResetWarningModal = ({
  onConfirm,
}: {
  onConfirm: () => void;
}) => (
  <feasibilityResetWarningModal.Component
    size="large"
    title="Vous allez perdre des données dans le dossier de faisabilité"
    iconId="fr-icon-warning-fill"
    titleProps={{
      className: "flex gap-2",
    }}
    buttons={[
      {
        children: "Annuler",
        priority: "secondary",
        type: "button",
      },
      {
        children: "Confirmer",
        priority: "primary",
        type: "button",
        nativeButtonProps: {
          onClick: onConfirm,
        },
      },
    ]}
  >
    <p>
      Vous êtes sur le point d’envoyer une nouvelle version du parcours au
      candidat. Cependant, si vous avez commencé à remplir le dossier de
      faisabilité, les informations renseignées seront perdues.
    </p>
    <p>Confirmez-vous la remise à zéro du dossier de faisabilité ?</p>
  </feasibilityResetWarningModal.Component>
);

const TrainingPage = () => {
  const {
    getCandidacyByIdWithReferentialStatus,
    candidacy,
    referential,
    submitTraining,
  } = useTrainingPage();

  const candidacyFinancingMethods =
    candidacy?.candidacyOnCandidacyFinancingMethods?.map((c) => ({
      id: c.candidacyFinancingMethod.id,
      amount: c.amount,
    })) || [];

  const candidacyFinancingMethodOtherSourceText =
    candidacy?.candidacyOnCandidacyFinancingMethods?.find(
      (c) => c.candidacyFinancingMethod.id === OTHER_FINANCING_METHOD_ID,
    )?.additionalInformation;

  const router = useRouter();
  const pendingTrainingResendValuesRef = useRef<TrainingFormValues | null>(
    null,
  );

  const sendTrainingForm = async (values: TrainingFormValues) => {
    try {
      const {
        certificationScope,
        candidacyFinancingMethods,
        candidacyFinancingMethodOtherSourceText,
        candidacyFinancingMethodOtherSourceChecked,
        ...rest
      } = values;

      const candidacyFinancingMethodsWithAdditionalData: {
        candidacyFinancingMethodId: string;
        amount: number;
        additionalInformation?: string;
      }[] = candidacyFinancingMethods.map((c) => ({
        candidacyFinancingMethodId: c.id,
        amount: c.amount,
        additionalInformation:
          c.id === OTHER_FINANCING_METHOD_ID
            ? candidacyFinancingMethodOtherSourceText
            : undefined,
      }));
      await submitTraining.mutateAsync({
        candidacyId: candidacy?.id,
        training: {
          ...rest,
          isCertificationPartial: certificationScope === "PARTIAL",
          candidacyFinancingMethodInfos:
            candidacyFinancingMethodsWithAdditionalData,
        },
      });
      successToast("Le parcours personnalisé a bien été envoyé.");
      router.push(`/candidacies/${candidacy?.id}/summary`);
    } catch (e) {
      graphqlErrorToast(e);
    }
  };

  const handleFormSubmit = async (values: TrainingFormValues) => {
    if (candidacy?.status === "PARCOURS_CONFIRME") {
      pendingTrainingResendValuesRef.current = values;
      feasibilityResetWarningModal.open();
      return;
    }

    await sendTrainingForm(values);
  };

  const handleConfirmFeasibilityReset = async () => {
    const values = pendingTrainingResendValuesRef.current;

    if (values) {
      feasibilityResetWarningModal.close();
      pendingTrainingResendValuesRef.current = null;
      await sendTrainingForm(values);
    }
  };

  const isTypologyAndConventionCollectiveEditable =
    !candidacy?.feasibility ||
    candidacy.feasibility.decision === "DRAFT" ||
    candidacy.feasibility.decision === "INCOMPLETE";

  return (
    <>
      <FeasibilityResetWarningModal onConfirm={handleConfirmFeasibilityReset} />
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
            {isTypologyAndConventionCollectiveEditable && (
              <Button
                priority="tertiary"
                className="ml-auto"
                size="small"
                iconId="fr-icon-edit-line"
                linkProps={{ href: `/candidacies/${candidacy.id}/typology` }}
              >
                Modifier
              </Button>
            )}
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
                candidacyFinancingMethods,
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
