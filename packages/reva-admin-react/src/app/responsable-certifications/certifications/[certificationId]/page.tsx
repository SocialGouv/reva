"use client";
import { ReactNode } from "react";
import { format } from "date-fns";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";

import { Tag } from "@codegouvfr/react-dsfr/Tag";

import { EnhancedSectionCard } from "@/components/card/enhanced-section-card/EnhancedSectionCard";

import { CertificationCompetenceBlocsSummaryCard } from "@/components/certifications/certification-competence-blocs-summary-card/CertificationCompetenceBlocsSummaryCard";
import { SmallNotice } from "../../../../components/small-notice/SmallNotice";

import { useUpdateCertificationPage } from "./updateCertification.hook";
import Notice from "@codegouvfr/react-dsfr/Notice";
import {
  CertificationJuryFrequency,
  CertificationJuryModality,
} from "@/graphql/generated/graphql";

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

const EvaluationModalities: { id: CertificationJuryModality; label: string }[] =
  [
    {
      id: "PRESENTIEL",
      label: "Présentiel",
    },
    {
      id: "A_DISTANCE",
      label: "À distance",
    },
    {
      id: "MISE_EN_SITUATION_PROFESSIONNELLE",
      label: "Mise en situation professionnelle",
    },
    {
      id: "ORAL",
      label: "Oral",
    },
  ];

const JuryFrequencies: { id: CertificationJuryFrequency; label: string }[] = [
  {
    id: "MONTHLY",
    label: "Tous les mois",
  },
  {
    id: "TRIMESTERLY",
    label: "Trimestrielle",
  },
  {
    id: "YEARLY",
    label: "1 fois / an",
  },
] as const;

const PageContent = ({
  certification,
}: {
  certification: CertificationForPage;
}) => {
  const router = useRouter();

  const isEditable = certification.status == "A_VALIDER_PAR_CERTIFICATEUR";

  const isDescriptionComplete =
    typeof certification.languages === "number" &&
    certification.juryModalities.length > 0 &&
    ((certification.juryFrequency && certification.juryFrequency?.length > 0) ||
      certification.juryFrequencyOther) &&
    certification.availableAt &&
    certification.expiresAt;

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
        <EnhancedSectionCard
          data-test="certification-description-card"
          title="Descriptif de la certification"
          status={isDescriptionComplete ? "COMPLETED" : "TO_COMPLETE"}
          isEditable={isEditable}
          titleIconClass="fr-icon-award-fill"
          buttonOnClickHref={`/responsable-certifications/certifications/${certification.id}/description`}
        >
          <div className="flex flex-col gap-4">
            <Info title="Visibilité sur France VAE">
              {certification.availableAt && certification.expiresAt ? (
                <div>{`du ${format(certification.availableAt, "dd/MM/yyyy")} au ${format(certification.expiresAt, "dd/MM/yyyy")}`}</div>
              ) : (
                "À compléter"
              )}
            </Info>

            <div>
              <label className="text-xs text-dsfrGray-mentionGrey">{`RNCP ${certification.codeRncp}`}</label>
              <h3 className="mb-0">{certification.label}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Info title="Niveau">{certification.degree.label}</Info>
              <Info title="Type de certification">
                {certification.typeDiplome || "Inconnu"}
              </Info>
              <Info title="Date de publication">
                {certification.rncpPublishedAt
                  ? format(certification.rncpPublishedAt, "dd/MM/yyyy")
                  : "Inconnue"}
              </Info>
              <Info title="Date d’échéance">
                {certification.rncpDeliveryDeadline
                  ? format(certification.rncpDeliveryDeadline, "dd/MM/yyyy")
                  : "Inconnue"}
              </Info>
            </div>

            <h3 className="mb-0">Jury</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Info title="Fréquence des jurys">
                {certification.juryFrequencyOther ||
                  JuryFrequencies.find(
                    ({ id }) => id == certification.juryFrequency,
                  )?.label ||
                  "À compléter"}
              </Info>
              <Info title="Modalités d'évaluation :">
                {certification.juryModalities.length > 0
                  ? certification.juryModalities.reduce(
                      (acc, modality) =>
                        `${acc}${acc && ","} ${EvaluationModalities.find(({ id }) => id == modality)?.label}`,
                      "",
                    )
                  : "À compléter"}
              </Info>
              {certification.juryPlace && (
                <Info title="Lieu où se déroulera le passage : ">
                  {certification.juryPlace}
                </Info>
              )}
            </div>

            <h3 className="mb-0">Domaines et sous-domaines du Formacode </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certification.domains.length == 0 && (
                <div>Aucun formacode associé</div>
              )}
              {certification.domains.map((domain) => (
                <div key={domain.id} className="flex flex-col gap-2">
                  <div>{domain.label}</div>
                  <div
                    key={domain.id}
                    className="flex flex-row flex-wrap gap-2"
                  >
                    {domain.children.map((subDomain) => (
                      <Tag key={subDomain.id}>
                        {`${subDomain.code} ${subDomain.label}`}
                      </Tag>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <Notice
              className="bg-transparent -ml-6 text-xs p-0 mt-2"
              title={
                <span className="text-sm inline font-normal">
                  Vous trouverez dans cette section des informations à compléter
                  et d’autres non modifiables. En cas d’erreur, contactez
                  directement France compétences.
                </span>
              }
            />
          </div>
        </EnhancedSectionCard>

        <CertificationCompetenceBlocsSummaryCard
          isEditable={isEditable}
          competenceBlocs={certification.competenceBlocs}
          onUpdateCompetenceBlocButtonClick={(blocId) =>
            router.push(
              `/responsable-certifications/certifications/${certification.id}/bloc-competence/${blocId}`,
            )
          }
        />
        <EnhancedSectionCard
          data-test="prerequisites-summary-card"
          isEditable={isEditable}
          title="Prérequis obligatoires"
          titleIconClass="fr-icon-success-fill"
          customButtonTitle="Modifier"
          buttonOnClickHref={`/responsable-certifications/certifications/${certification.id}/prerequisites`}
        >
          {certification.prerequisites.length ? (
            <ul className="ml-10" data-test="prerequisite-list">
              {certification.prerequisites.map((p) => (
                <li key={p.id}>{p.label}</li>
              ))}
            </ul>
          ) : (
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
        </EnhancedSectionCard>
      </div>
    </div>
  );
};

const Info = ({
  title,
  children,
  className,
  "data-test": dataTest,
}: {
  title: string;
  children: ReactNode;
  className?: string;
  "data-test"?: string;
}) => (
  <dl data-test={dataTest} className={`${className || ""}`}>
    <dt className="mb-1">{title}</dt>
    <dd className="font-medium">{children}</dd>
  </dl>
);
