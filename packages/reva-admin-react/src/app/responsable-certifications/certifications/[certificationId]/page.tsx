"use client";
import { useParams } from "next/navigation";
import { useUpdateCertificationPage } from "./updateCertification.hook";
import { CertificationCompetenceBlocsSummaryCard } from "@/components/certifications/certification-competence-blocs-summary-card/CertificationCompetenceBlocsSummaryCard";
import { useRouter } from "next/navigation";
import { SectionCard } from "../../../../components/card/section-card/SectionCard";
import { SmallNotice } from "../../../../components/small-notice/SmallNotice";

type CertificationForPage = Exclude<
  ReturnType<typeof useUpdateCertificationPage>["certification"],
  undefined
>;

export default function UpdateCertificationForCertificationRegistryManagerPage() {
  const { certificationId } = useParams<{
    certificationId: string;
  }>();

  const { certification, getCertificationQueryStatus } =
    useUpdateCertificationPage({ certificationId });
  return getCertificationQueryStatus === "success" && certification ? (
    <PageContent certification={certification} />
  ) : null;
}

const PageContent = ({
  certification,
}: {
  certification: CertificationForPage;
}) => {
  const router = useRouter();
  return (
    <div data-test="certification-registry-manager-update-certification-page">
      <h1>
        {certification.codeRncp} - {certification.label}
      </h1>
      <p className="mb-12 text-xl">
        Relisez, complétez et/ou modifiez les informations récupérées via France
        compétences avant de valider la certification. Une fois la certification
        validée et visible sur la plateforme, ces informations seront affichées
        aux AAP et aux candidats.
      </p>
      <div className="flex flex-col gap-8">
        <CertificationCompetenceBlocsSummaryCard
          isEditable
          competenceBlocs={certification.competenceBlocs}
          onAddBlocCompetenceButtonClick={() =>
            router.push(
              `/responsable-certifications/certifications/${certification.id}/bloc-competence/add`,
            )
          }
          onUpdateCompetenceBlocButtonClick={(blocId) =>
            router.push(
              `/responsable-certifications/certifications/${certification.id}/bloc-competence/${blocId}`,
            )
          }
        />
        <SectionCard
          data-test="prerequisites-summary-card"
          title="Prérequis obligatoires"
          titleIconClass="fr-icon-success-fill"
        >
          {certification.prerequisites.length ? null : (
            <p className="ml-10 mb-0" data-test="no-prerequisite-message">
              Aucun prérequis renseigné pour cette certification.
            </p>
          )}
          <SmallNotice className="mt-6">
            Si les prérequis obligatoires ont pu être récupérés depuis France
            compétences, ils seront affichés ci-dessus. Vous pouvez revoir
            l'ordre des prérequis ou corriger des fautes de frappe en cliquant
            sur le bouton “Modifier”.
          </SmallNotice>
        </SectionCard>
      </div>
    </div>
  );
};
