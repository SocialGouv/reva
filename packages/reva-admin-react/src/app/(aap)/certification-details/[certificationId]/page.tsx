"use client";

import Button from "@codegouvfr/react-dsfr/Button";
import { useParams, useSearchParams } from "next/navigation";

import { useAuth } from "@/components/auth/auth";
import { CertificationAdditionalInfoSummaryCard } from "@/components/certifications/certification-additional-info-summary-card/CertificationAdditionalInfoSummaryCard";
import { CertificationCompetenceBlocsSummaryCard } from "@/components/certifications/certification-competence-blocs-summary-card/CertificationCompetenceBlocsSummaryCard";
import CertificationPrerequisitesCard from "@/components/certifications/certification-prerequisites-card/CertificationPrerequisitesCard";
import CertificationSummaryCard from "@/components/certifications/certification-summary-card/CertificationSummaryCard";

import { useCertificationDetailsPage } from "./getCertificationDetails.hook";

type CertificationForPage = Exclude<
  ReturnType<typeof useCertificationDetailsPage>["certification"],
  undefined
>;

export default function CertificationDetailsPage() {
  const { certificationId } = useParams<{
    certificationId: string;
  }>();
  const searchParams = useSearchParams();
  const candidacyId = searchParams.get("candidacyId");

  const { certification, getCertificationQueryStatus, candidacy } =
    useCertificationDetailsPage({ certificationId, candidacyId });

  const { isAdmin, isGestionnaireMaisonMereAAP, isOrganism } = useAuth();
  const canUpdateCertification =
    (isAdmin || isGestionnaireMaisonMereAAP || isOrganism) &&
    candidacy?.status &&
    [
      "PROJET",
      "VALIDATION",
      "PRISE_EN_CHARGE",
      "PARCOURS_ENVOYE",
      "PARCOURS_CONFIRME",
      "DOSSIER_FAISABILITE_INCOMPLET",
    ].includes(candidacy?.status) &&
    !candidacy.candidacyDropOut;

  if (!certification || getCertificationQueryStatus !== "success") {
    return null;
  }

  return (
    <div className="flex flex-col gap-12">
      <h1 className="m-0">
        RNCP {certification.codeRncp} - {certification.label}
      </h1>
      {candidacy && canUpdateCertification && (
        <Button
          data-testid="candidacy-change-certification-button"
          linkProps={{
            href: `/candidacies/${candidacyId}/reorientation`,
          }}
        >
          Changer de certification
        </Button>
      )}
      <PageContent certification={certification} />
    </div>
  );
}

const PageContent = ({
  certification,
}: {
  certification: CertificationForPage;
}) => {
  return (
    <div data-testid="certification-details-page" className="w-full">
      <div className="flex flex-col gap-8">
        <CertificationSummaryCard certification={certification} />
        <CertificationCompetenceBlocsSummaryCard
          isEditable={false}
          competenceBlocs={certification.competenceBlocs}
        />
        <CertificationPrerequisitesCard
          prerequisites={certification.prerequisites}
          isEditable={false}
        />
        <CertificationAdditionalInfoSummaryCard
          isAdmin
          certificationAdditionalInfo={certification.additionalInfo}
        />
      </div>
      <hr className="mt-8" />
    </div>
  );
};
