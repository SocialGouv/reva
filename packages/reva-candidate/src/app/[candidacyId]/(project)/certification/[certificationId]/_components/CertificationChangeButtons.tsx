"use client";
import Button from "@codegouvfr/react-dsfr/Button";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useParams, useRouter } from "next/navigation";

import { graphqlErrorToast } from "@/components/toast/toast";

import { useCandidacyForCertification } from "./certification.hooks";

const certificationWarningModal = createModal({
  id: "certification-warning",
  isOpenedByDefault: false,
});

export default function CertificationChangeButtons({
  selectedCertification,
}: {
  selectedCertification: {
    id: string;
    isAapAvailable: boolean;
  };
}) {
  const router = useRouter();
  const params = useParams<{ certificationId: string }>();
  const selectedCertificationId = params.certificationId;

  const {
    canEditCandidacy,
    updateCertification,
    certification,
    candidacy,
    isRefetching,
  } = useCandidacyForCertification();

  if (isRefetching || !candidacy) {
    return null;
  }

  const doUpdateCertification = async () => {
    try {
      const response = await updateCertification.mutateAsync({
        certificationId: selectedCertificationId!,
      });
      if (response) {
        router.push("/");
      }
    } catch (error) {
      graphqlErrorToast(error);
    }
  };

  const onSubmit = async () => {
    if (
      candidacy.certification?.isAapAvailable &&
      candidacy.typeAccompagnement === "ACCOMPAGNE" &&
      selectedCertification?.isAapAvailable === false
    ) {
      certificationWarningModal.open();
    } else {
      await doUpdateCertification();
    }
  };

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4 justify-between mt-6">
      <Button
        priority="secondary"
        className="justify-center w-[100%] md:w-fit"
        onClick={() => {
          if (certification?.id === selectedCertificationId) {
            router.push("../../");
          } else {
            router.push("../../search-certification");
          }
        }}
      >
        Retour
      </Button>
      {certification?.id === selectedCertificationId &&
        candidacy.hasMoreThanOneCertificationAvailable && (
          <Button
            data-test="change-certification-button"
            priority="tertiary no outline"
            className="justify-center w-[100%] md:w-fit"
            onClick={() => {
              router.push("../../search-certification");
            }}
            disabled={!canEditCandidacy}
          >
            Changer de diplôme
          </Button>
        )}

      {certification?.id !== selectedCertificationId && (
        <Button
          data-test="submit-certification-button"
          className="justify-center w-[100%]  md:w-fit"
          disabled={updateCertification.isPending || !canEditCandidacy}
          onClick={onSubmit}
        >
          Choisir ce diplôme
        </Button>
      )}

      <certificationWarningModal.Component
        title="Vous vous apprêtez à changer de diplôme"
        iconId="fr-icon-warning-fill"
        buttons={[
          {
            doClosesModal: true,
            children: "Annuler",
          },
          {
            onClick: async () => {
              await doUpdateCertification();
            },
            disabled: updateCertification.isPending,
            children: "Confirmer",
          },
        ]}
      >
        Tout changement de diplôme impliquera une mise à jour de votre espace.
        Vous devrez ajouter à nouveau les informations essentielles au démarrage
        de votre parcours. Souhaitez-vous continuer ?
      </certificationWarningModal.Component>
    </div>
  );
}
