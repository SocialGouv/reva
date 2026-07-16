"use client";

import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import Button from "@codegouvfr/react-dsfr/Button";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { Panel } from "@/components/layout/Panel";
import { DffSummary } from "@/components/legacy/organisms/DffSummary/DffSummary";
import {
  errorToast,
  graphqlErrorToast,
  successToast,
} from "@/components/toast/toast";

import { Candidacy } from "@/graphql/generated/graphql";

import CertificationAuthoritySection from "./_components/CertificationAuthoritySection";
import { useSendFileCertificationAuthority } from "./_components/sendFileCertificationAuthority.hook";

export default function SendFileCertificationAuthorityPage() {
  const router = useRouter();

  const {
    dematerializedFeasibilityFile,
    sendToCertificationAuthorityMutation,
    candidacy,
    feasibility,
  } = useSendFileCertificationAuthority();

  const certificationAuthorities = useMemo(() => {
    if (!candidacy?.certificationAuthorities) {
      return [];
    }
    return candidacy.certificationAuthorities;
  }, [candidacy?.certificationAuthorities]);

  const [
    selectedCertificationAuthorityId,
    setCertificationAuthoritySelectedId,
  ] = useState<string | null>(null);

  // Get the certification authority id from the candidacy.
  // This is the certification authority that can be selected by the user in the candidacy summary early in the candidacy process.
  const candidcayCertificationAuthorityId =
    candidacy?.certificationAuthority?.id;

  // Get the default certification authority for the candidacy.
  // If there is only one certification authority choice available, use it as the default
  // This will be used if there is no certification authority selected for the candidacy, but only if there is only one choice available.
  const defaultCertificationAuthorityId =
    certificationAuthorities.length === 1 ? certificationAuthorities[0].id : "";

  // if no certification authority is selected in this page, use the one from the candidacy if there is one. If not use the default one (if available)
  const certificationAuthoritySelectedId =
    selectedCertificationAuthorityId ??
    candidcayCertificationAuthorityId ??
    defaultCertificationAuthorityId;

  const [
    certificationAuthoritySelectError,
    setCertificationAuthoritySelectError,
  ] = useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const decision = feasibility?.decision;
  const feasibilityFileSentAt = feasibility?.feasibilityFileSentAt;
  const feasibilityIsIncomplete = decision === "INCOMPLETE";
  const feasibilityHasBeenSent = !!feasibilityFileSentAt;
  const feasibilityFileNeedsNewOrResendAction =
    !feasibilityHasBeenSent || feasibilityIsIncomplete;
  const isReadyToBeSentToCertificationAuthority =
    dematerializedFeasibilityFile?.isReadyToBeSentToCertificationAuthority;

  const handleSendFile = async () => {
    if (!dematerializedFeasibilityFile) {
      return;
    }

    if (!certificationAuthoritySelectedId) {
      setCertificationAuthoritySelectError(true);
      errorToast(
        "Impossible d'envoyer le dossier. Merci de sélectionner un certificateur",
      );
      return;
    } else {
      setCertificationAuthoritySelectError(false);
    }

    try {
      setIsSubmitting(true);
      await sendToCertificationAuthorityMutation({
        dematerializedFeasibilityFileId: dematerializedFeasibilityFile.id,
        certificationAuthorityId: certificationAuthoritySelectedId,
      });
      successToast("Le dossier de faisabilité a été envoyé au certificateur");
      router.push("../");
    } catch (error) {
      graphqlErrorToast(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Panel>
      <div className="flex flex-col">
        <Breadcrumb
          currentPageLabel="Envoi au certificateur"
          className="mb-2"
          segments={[
            {
              label: "Ma candidature",
              linkProps: {
                href: "../../",
              },
            },
            {
              label: "Dossier de faisabilité",
              linkProps: {
                href: "../",
              },
            },
          ]}
        />
        <h1 className="mb-0">Dossier de faisabilité</h1>

        <div className="flex flex-col gap-8">
          <DffSummary candidacy={candidacy as Candidacy} />

          <div className="border border-gray-200">
            <CertificationAuthoritySection
              certificationAuthorities={certificationAuthorities}
              certificationAuthoritySelectedId={
                certificationAuthoritySelectedId
              }
              certificationAuthoritySelectError={
                certificationAuthoritySelectError
              }
              setCertificationAuthoritySelectedId={
                setCertificationAuthoritySelectedId
              }
              feasibilityHasBeenSentToCertificationAuthority={
                !!feasibilityFileSentAt && !feasibilityIsIncomplete
              }
            />
          </div>

          <div className="mt-4 flex justify-between">
            <Button priority="secondary" onClick={() => router.push("../")}>
              Retour
            </Button>
            <Button
              onClick={handleSendFile}
              disabled={
                !feasibilityFileNeedsNewOrResendAction ||
                !isReadyToBeSentToCertificationAuthority ||
                isSubmitting
              }
            >
              Envoyer au certificateur
            </Button>
          </div>
        </div>
      </div>
    </Panel>
  );
}
