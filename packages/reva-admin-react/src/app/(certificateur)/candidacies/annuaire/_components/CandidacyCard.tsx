import Card from "@codegouvfr/react-dsfr/Card";
import Tag from "@codegouvfr/react-dsfr/Tag";
import { format, isAfter } from "date-fns";

import {
  CandidacyStatusTag,
  DropoutCandidacyStatus,
  JuryCandidacyStatus,
} from "@/components/candidacy-status-tag/CandidacyStatusTag";

import {
  CandidacyStatusStep,
  TypeAccompagnement,
} from "@/graphql/generated/graphql";
import { CandidacyStatus } from "@/graphql/generated/graphql";

export const CandidacyCard = ({
  candidateFullName,
  cohorteVaeCollective,
  certificationCode,
  certificationLabel,
  organismLabel,
  status,
  statusHistory,
  jury,
  dropout,
  departmentLabel,
  feasibilityFileSentAt,
  dossierDeValidationSentAt,
  dateOfSession,
  candidacyId,
  searchResultLink,
  typeAccompagnement,
}: {
  candidateFullName: string;
  cohorteVaeCollective: {
    nom: string;
    commanditaireVaeCollective: {
      raisonSociale: string;
    };
  } | null;
  feasibilityFileSentAt: number | null;
  dossierDeValidationSentAt: number | null;
  dateOfSession: number | null;
  certificationCode: string;
  certificationLabel: string;
  organismLabel: string;
  typeAccompagnement: TypeAccompagnement;
  status: CandidacyStatusStep;
  statusHistory: Omit<CandidacyStatus, "id">[];
  jury?: JuryCandidacyStatus | null;
  dropout?: DropoutCandidacyStatus | null;
  departmentLabel: string;
  candidacyId: string;
  searchResultLink: (candidacyId: string) => string;
}) => {
  const currentStatus = status;
  const previousStatus = statusHistory.sort((a, b) =>
    isAfter(a.createdAt, b.createdAt) ? 1 : -1,
  )[1]?.status;

  return (
    <Card
      title={candidateFullName}
      shadow
      size="small"
      start={
        <div className="flex flex-row gap-2 mb-2">
          {typeAccompagnement == "AUTONOME" && <Tag small>Autonome</Tag>}

          {typeAccompagnement == "ACCOMPAGNE" && <Tag small>Accompagné</Tag>}

          {!!cohorteVaeCollective && <Tag small>VAE Collective</Tag>}

          {currentStatus != "ARCHIVE" && (
            <CandidacyStatusTag status={currentStatus} jury={jury} />
          )}

          {currentStatus === "ARCHIVE" && previousStatus && (
            <CandidacyStatusTag status={previousStatus} jury={jury} />
          )}

          {!!dropout && <Tag small>Candidature abandonnée</Tag>}

          {currentStatus === "ARCHIVE" && <Tag small>Candidature archivée</Tag>}
        </div>
      }
      detail={departmentLabel}
      desc={
        <div>
          <span>
            RNCP {certificationCode} {certificationLabel}
          </span>
          {organismLabel && (
            <>
              <br />
              <span>{organismLabel}</span>
            </>
          )}
          {cohorteVaeCollective && (
            <>
              <br />
              <span>
                {cohorteVaeCollective.commanditaireVaeCollective.raisonSociale}{" "}
                (Cohorte : {cohorteVaeCollective.nom})
              </span>
            </>
          )}
        </div>
      }
      endDetail={
        <>
          <div>
            {feasibilityFileSentAt &&
              `Dossier envoyé le ${format(feasibilityFileSentAt, "d MMM yyyy")}`}
          </div>
          <div>
            {dossierDeValidationSentAt &&
              `Dossier de validation envoyé le ${format(dossierDeValidationSentAt, "d MMM yyyy")}`}
          </div>
          <div>
            {dateOfSession &&
              `Jury programmé le ${format(dateOfSession, "d MMM yyyy")}`}
          </div>
        </>
      }
      linkProps={{
        href: searchResultLink(candidacyId),
      }}
      key={candidacyId}
      enlargeLink
    />
  );
};
