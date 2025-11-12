import Card from "@codegouvfr/react-dsfr/Card";
import Tag from "@codegouvfr/react-dsfr/Tag";
import { format } from "date-fns";

import {
  CandidacyStatusTag,
  DropoutCandidacyStatus,
  JuryCandidacyStatus,
} from "@/components/candidacy-status-tag/CandidacyStatusTag";

import { CandidacyStatusStep } from "@/graphql/generated/graphql";

export const CandidacyCard = ({
  candidateFullName,
  cohorteVaeCollective,
  certificationCode,
  certificationLabel,
  organismLabel,
  candidacyStatus,
  jury,
  dropout,
  departmentLabel,
  feasibilityFileSentAt,
  dossierDeValidationSentAt,
  dateOfSession,
  candidacyId,
  searchResultLink,
  organismModalitateAccompagnement,
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
  organismModalitateAccompagnement: string;
  candidacyStatus: CandidacyStatusStep;
  jury?: JuryCandidacyStatus | null;
  dropout?: DropoutCandidacyStatus | null;
  departmentLabel: string;
  candidacyId: string;
  searchResultLink: (candidacyId: string) => string;
}) => {
  return (
    <Card
      title={candidateFullName}
      shadow
      size="small"
      start={
        <ul className="list-none m-0 mb-1 p-0 flex gap-2">
          {cohorteVaeCollective && (
            <li>
              <Tag small>VAE Collective</Tag>
            </li>
          )}
          {organismModalitateAccompagnement && (
            <li>
              <Tag small>
                {organismModalitateAccompagnement === "LIEU_ACCUEIL"
                  ? "Sur site"
                  : "À distance"}
              </Tag>
            </li>
          )}
          <li>
            <CandidacyStatusTag
              status={candidacyStatus}
              jury={jury}
              dropout={dropout}
            />
          </li>
        </ul>
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
