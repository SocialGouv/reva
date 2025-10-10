import Tag from "@codegouvfr/react-dsfr/Tag";
import { format } from "date-fns";
import { type ReactNode } from "react";

import { EnhancedSectionCard } from "@/components/card/enhanced-section-card/EnhancedSectionCard";

import {
  CertificationJuryFrequency,
  CertificationJuryTypeOfModality,
} from "@/graphql/generated/graphql";

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

export default function CertificationSummaryCard({
  certification,
}: {
  certification: {
    codeRncp: string;
    label: string;
    degree: {
      level: number;
    };
    typeDiplome?: string | null;
    rncpEffectiveAt?: number | null;
    rncpPublishedAt?: number | null;
    rncpExpiresAt?: number | null;
    availableAt: number;
    expiresAt: number;
    juryTypeSoutenanceOrale?: CertificationJuryTypeOfModality | null;
    juryTypeMiseEnSituationProfessionnelle?: CertificationJuryTypeOfModality | null;
    juryPlace?: string | null;
    juryFrequency?: CertificationJuryFrequency | null;
    juryFrequencyOther?: string | null;
    juryEstimatedCost?: number | null;
    domains: {
      id: string;
      label: string;
      children: {
        id: string;
        label: string;
        code: string;
      }[];
    }[];
    prerequisites: {
      id: string;
      label: string;
    }[];
  };
}) {
  return (
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
          <Info title="Niveau">{certification.degree.level}</Info>
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
          {certification.juryTypeSoutenanceOrale && (
            <Info title="Entretien : ">
              {(certification.juryTypeSoutenanceOrale == "LES_DEUX" ||
                certification.juryTypeSoutenanceOrale == "PRESENTIEL") && (
                <Tag>Présentiel</Tag>
              )}
              {(certification.juryTypeSoutenanceOrale == "LES_DEUX" ||
                certification.juryTypeSoutenanceOrale == "A_DISTANCE") && (
                <Tag>À distance</Tag>
              )}
            </Info>
          )}
          {certification.juryTypeMiseEnSituationProfessionnelle && (
            <Info title="Mise en situation professionnelle : ">
              {(certification.juryTypeMiseEnSituationProfessionnelle ==
                "LES_DEUX" ||
                certification.juryTypeMiseEnSituationProfessionnelle ==
                  "PRESENTIEL") && <Tag>Présentiel</Tag>}
              {(certification.juryTypeMiseEnSituationProfessionnelle ==
                "LES_DEUX" ||
                certification.juryTypeMiseEnSituationProfessionnelle ==
                  "A_DISTANCE") && <Tag>À distance</Tag>}
            </Info>
          )}

          <Info title="Fréquence des jurys">
            {certification.juryFrequencyOther ||
              JuryFrequencies.find(
                ({ id }) => id == certification.juryFrequency,
              )?.label ||
              "À compléter"}
          </Info>
          {certification.juryPlace && (
            <Info title="Lieu où se déroulera le passage : ">
              {certification.juryPlace}
            </Info>
          )}
          <Info title="Estimation des frais de certification">
            {certification.juryEstimatedCost
              ? `${certification.juryEstimatedCost}€`
              : "Les frais de jury n'ont pas été renseignés par le certificateur, rapprochez vous de celui-ci pour plus d'informations."}
          </Info>
        </div>

        <h3 className="mb-0">Domaines et sous-domaines du Formacode </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certification.domains.length == 0 && (
            <div>Aucun formacode associé</div>
          )}
          {certification.domains.map((domain) => (
            <div key={domain.id} className="flex flex-col gap-2">
              <div>{domain.label}</div>
              <div key={domain.id} className="flex flex-row flex-wrap gap-2">
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
  );
}

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
