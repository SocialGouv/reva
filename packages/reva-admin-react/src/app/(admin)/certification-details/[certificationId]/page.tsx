"use client";
import { useCertificationDetailsPage } from "./getCertificationDetails.hook";
import { useParams } from "next/navigation";
import { CertificationCompetenceBlocsSummaryCard } from "@/components/certifications/certification-competence-blocs-summary-card/CertificationCompetenceBlocsSummaryCard";
import { CertificationAdditionalInfoSummaryCard } from "@/components/certifications/certification-additional-info-summary-card/CertificationAdditionalInfoSummaryCard";
import CertificationSummaryCard from "@/components/certifications/certification-summary-card/CertificationSummaryCard";
import CertificationPrerequisitesCard from "@/components/certifications/certification-prerequisites-card/CertificationPrerequisitesCard";

type CertificationForPage = Exclude<
  ReturnType<typeof useCertificationDetailsPage>["certification"],
  undefined
>;

export default function CertificationDetailsPage() {
  const { certificationId } = useParams<{
    certificationId: string;
  }>();

  const { certification, getCertificationQueryStatus } =
    useCertificationDetailsPage({ certificationId });
  return getCertificationQueryStatus === "success" && certification ? (
    <>
      <h1>
        RNCP {certification.codeRncp} - {certification.label}
      </h1>
      <PageContent certification={certification} />
    </>
  ) : null;
}

const PageContent = ({
  certification,
}: {
  certification: CertificationForPage;
}) => {
  return (
    <div data-test="certification-details-page" className="w-full">
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
