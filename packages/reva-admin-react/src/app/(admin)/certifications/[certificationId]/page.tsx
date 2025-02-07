"use client";
import { EnhancedSectionCard } from "@/components/card/enhanced-section-card/EnhancedSectionCard";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useUpdateCertificationPage } from "./updateCertification.hook";
import { useParams, useRouter } from "next/navigation";
import { ReactNode } from "react";
import { format } from "date-fns";
import { Tag } from "@codegouvfr/react-dsfr/Tag";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { NoCertificationRegistryManagerAlert } from "./structure/_components/NoCertificationRegistryManagerAlert";
import { NoCertificationAuthorityAlert } from "./structure/_components/NoCertificationAuthorityAlert";
import { CertificationCompetenceBlocsSummaryCard } from "@/components/certifications/certification-competence-blocs-summary-card/CertificationCompetenceBlocsSummaryCard";
import {
  CertificationJuryFrequency,
  CertificationJuryModality,
} from "@/graphql/generated/graphql";
import { CertificationAdditionalInfoSummaryCard } from "@/components/certifications/certification-additional-info-summary-card/CertificationAdditionalInfoSummaryCard";
import { CertificationActivitiesSummaryCard } from "@/components/certifications/certification-activities-summary-card/CertificationActivitiesSummaryCard";

type CertificationForPage = Exclude<
  ReturnType<typeof useUpdateCertificationPage>["certification"],
  undefined
>;

export default function UpdateCertificationPage() {
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

  const structureSummaryCardComplete =
    !!certification.certificationAuthorityStructure;

  const {
    sendCertificationToRegistryManager,
    resetCompetenceBlocsByCertification,
  } = useUpdateCertificationPage({
    certificationId: certification.id,
  });

  const onClickSend = async () => {
    try {
      await sendCertificationToRegistryManager.mutateAsync();
      successToast("La certification a bien été envoyée");
    } catch (error) {
      graphqlErrorToast(error);
    }
  };

  const onClickReset = async () => {
    try {
      await resetCompetenceBlocsByCertification.mutateAsync();
      successToast(
        "Les blocs de compétences de la certification ont bien été réinitialisés",
      );
    } catch (error) {
      graphqlErrorToast(error);
    }
  };

  const isEditable = certification.status == "BROUILLON";

  return (
    <div data-test="update-certification-page">
      <h1>{certification.label}</h1>
      <p className="mb-12 text-xl">
        Pour faciliter l’ajout, renseignez le code RNCP pour pré-remplir le
        document avec les informations de France compétences et du Formacode.
        Ensuite, vous pourrez renseigner une structure certificatrice et (à
        minima) un gestionnaire des candidatures.
      </p>

      <div className="flex flex-col gap-8">
        {isEditable && (
          <div
            data-test="button-reset"
            className="flex flex-row justify-end mt-2"
          >
            <Button
              type="button"
              iconId="fr-icon-refresh-line"
              onClick={onClickReset}
              priority="tertiary no outline"
              title="Label button"
            >
              Réinitialiser depuis France Compétences
            </Button>
          </div>
        )}

        <EnhancedSectionCard
          data-test="certification-description-card"
          title="Descriptif de la certification"
          titleIconClass="fr-icon-award-fill"
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
                {certification.rncpExpiresAt
                  ? format(certification.rncpExpiresAt, "dd/MM/yyyy")
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
          </div>
        </EnhancedSectionCard>

        <CertificationCompetenceBlocsSummaryCard
          isEditable={isEditable}
          competenceBlocs={certification.competenceBlocs}
          onAddBlocCompetenceButtonClick={() =>
            router.push(
              `/certifications/${certification.id}/bloc-competence/add`,
            )
          }
          onUpdateCompetenceBlocButtonClick={(blocId) =>
            router.push(
              `/certifications/${certification.id}/bloc-competence/${blocId}`,
            )
          }
        />

        <CertificationActivitiesSummaryCard
          // isEditable={isEditable}
          activities={
            certification.FCCertification?.ACTIVITES_VISEES || undefined
          }
          // competenceBlocs={certification.competenceBlocs}
          // onUpdateCompetenceBlocButtonClick={(blocId) =>
          //   router.push(
          //     `/responsable-certifications/certifications/${certification.id}/bloc-competence/${blocId}`,
          //   )
          // }
        />

        <EnhancedSectionCard
          data-test="prerequisites-summary-card"
          title="Prérequis obligatoires"
          titleIconClass="fr-icon-success-fill"
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
        </EnhancedSectionCard>

        <CertificationAdditionalInfoSummaryCard
          isAdmin
          updateButtonHref={`/responsable-certifications/certifications/${certification.id}/additional-info`}
          certificationAdditionalInfo={certification.additionalInfo}
        />

        <EnhancedSectionCard
          data-test="certification-structure-summary-card"
          title="Structure certificatrice et gestionnaires"
          titleIconClass="fr-icon-group-fill"
          isEditable
          status={structureSummaryCardComplete ? "COMPLETED" : "TO_COMPLETE"}
          buttonOnClickHref={
            isEditable
              ? `/certifications/${certification.id}/structure`
              : undefined
          }
        >
          {structureSummaryCardComplete && (
            <>
              <Info
                title="Structure certificatrice"
                data-test="certification-authority-structure-label"
              >
                {certification.certificationAuthorityStructure?.label}
              </Info>
              {!certification.certificationAuthorityStructure
                ?.certificationRegistryManager && (
                <NoCertificationRegistryManagerAlert className="mt-4" />
              )}
              {certification.certificationAuthorities.length ? (
                <>
                  <h3 className="mt-4 mb-2">
                    Gestionnaires des candidatures liés à cette structure
                  </h3>
                  <ul
                    className="list-none"
                    data-test="certification-authority-list"
                  >
                    {certification.certificationAuthorities.map((ca) => (
                      <li
                        key={ca.id}
                        className="border-t border-light-decisions-border-border-default-grey font-bold pt-2 mb-1"
                      >
                        {ca.label}
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <NoCertificationAuthorityAlert className="mt-4" />
              )}
            </>
          )}
        </EnhancedSectionCard>
      </div>
      <hr className="mt-8" />
      {isEditable && (
        <>
          <h2>Validation par le responsable des certifications</h2>
          <div className="flex">
            <p className="mb-0">
              Lorsque la certification est prête, vous devez l’envoyer au
              responsable des certifications pour validation. Si aucun
              responsable de certifications n’existe pour le moment et qu’aucune
              validation n’est possible, elle pourra être visible des AAP mais
              pas encore des candidats.
            </p>
            <Button
              data-test="button-send"
              disabled={!certification.certificationAuthorityStructure}
              className="h-[40px] self-end"
              onClick={onClickSend}
            >
              Envoyer
            </Button>
          </div>
          <hr className="mt-8 mb-6" />
        </>
      )}
      <Button
        priority="secondary"
        linkProps={{ href: "/certifications", target: "_self" }}
      >
        Retour
      </Button>
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
