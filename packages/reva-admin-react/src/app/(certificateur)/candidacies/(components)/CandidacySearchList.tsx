import Card from "@codegouvfr/react-dsfr/Card";
import Tag from "@codegouvfr/react-dsfr/Tag";
import { format, isAfter } from "date-fns";

import {
  SearchList,
  SearchListProps,
} from "@/components/search/search-list/SearchList";
import { CandidacyStatusStep, JuryResult } from "@/graphql/generated/graphql";

type Jury = {
  dateOfSession: number;
  result?: JuryResult | null;
} | null;

type Dropout = {
  createdAt: number;
} | null;

const StatusTag = ({
  status,
  jury,
  dropout,
}: {
  status: CandidacyStatusStep;
  jury?: Jury;
  dropout?: Dropout;
}) => {
  const isJuryUpcoming = jury && isAfter(jury.dateOfSession, new Date());

  const resultIsSuccess =
    jury?.result === "FULL_SUCCESS_OF_FULL_CERTIFICATION" ||
    jury?.result === "FULL_SUCCESS_OF_PARTIAL_CERTIFICATION";
  const resultIsPartialSuccess =
    jury?.result === "PARTIAL_SUCCESS_OF_PARTIAL_CERTIFICATION" ||
    jury?.result === "PARTIAL_SUCCESS_PENDING_CONFIRMATION" ||
    jury?.result === "PARTIAL_SUCCESS_OF_FULL_CERTIFICATION";

  switch (true) {
    case status === "ARCHIVE":
      return <Tag small>Dossier supprimé</Tag>;
    case !!dropout:
      return <Tag small>Dossier abandonné</Tag>;
    case status === "DOSSIER_FAISABILITE_ENVOYE":
      return <Tag small>Nouveau dossier de faisabilité</Tag>;
    case status === "DOSSIER_FAISABILITE_COMPLET":
      return <Tag small>En attente de recevabilité</Tag>;
    case status === "DOSSIER_FAISABILITE_INCOMPLET":
      return <Tag small>Dossier de faisabilité incomplet</Tag>;
    case status === "DOSSIER_FAISABILITE_RECEVABLE":
      return <Tag small>Recevable</Tag>;
    case status === "DOSSIER_FAISABILITE_NON_RECEVABLE":
      return <Tag small>Non recevable</Tag>;
    case status === "DOSSIER_DE_VALIDATION_ENVOYE" && !jury:
      return <Tag small>Dossier de validation reçu</Tag>;
    case status === "DOSSIER_DE_VALIDATION_SIGNALE":
      return <Tag small>Dossier de validation signalé</Tag>;
    case isJuryUpcoming:
      return <Tag small>Jury programmé</Tag>;
    case jury && !isJuryUpcoming && !jury.result:
      return <Tag small>En attente de résultat</Tag>;
    case resultIsPartialSuccess:
      return <Tag small>Réussite partielle</Tag>;
    case resultIsSuccess:
      return <Tag small>Réussite totale</Tag>;
    default:
      return null;
  }
};

type CandidacySearchResult<T> = T & {
  id: string;
  feasibilityFileSentAt?: number | null;
  dossierDeValidationSentAt?: number | null;
  dateOfSession?: number | null;
  candidacy: {
    id: string;
    status: CandidacyStatusStep;
    cohorteVaeCollective?: {
      nom: string;
      commanditaireVaeCollective: {
        raisonSociale: string;
      };
    } | null;
    certification?: { label: string; codeRncp: string } | null;
    organism?: { label: string; nomPublic?: string | null } | null;
    jury?: Jury;
    candidacyDropOut?: Dropout;
    candidate?: {
      department?: { code: string; label: string } | null;
      firstname: string;
      lastname: string;
    } | null;
  };
};

export const CandidacySearchList = <T,>({
  title,
  searchFilter,
  searchResultsPage,
  searchResultLink,
}: SearchListProps<CandidacySearchResult<T>> & {
  searchResultLink: (candidacyId: string) => string;
}) => {
  if (!searchResultsPage) return null;
  return (
    <SearchList<CandidacySearchResult<T>>
      title={title}
      searchFilter={searchFilter}
      searchResultsPage={searchResultsPage}
    >
      {(r) => (
        <Card
          title={`${r.candidacy.candidate?.firstname} ${r.candidacy.candidate?.lastname}`}
          shadow
          size="small"
          start={
            <ul className="list-none m-0 mb-1 p-0">
              {!!r.candidacy.cohorteVaeCollective && (
                <li>
                  <Tag small>VAE Collective</Tag>
                </li>
              )}
              <li>
                <StatusTag
                  status={r.candidacy.status}
                  jury={r.candidacy.jury}
                  dropout={r.candidacy.candidacyDropOut}
                />
              </li>
            </ul>
          }
          detail={`${r.candidacy.candidate?.department?.label} (${r.candidacy.candidate?.department?.code})`}
          desc={
            <div>
              <span>
                RNCP {r.candidacy.certification?.codeRncp}{" "}
                {r.candidacy.certification?.label}
              </span>
              {r.candidacy.organism && (
                <>
                  <br />
                  <span>
                    {r.candidacy.organism?.nomPublic ||
                      r.candidacy.organism?.label}
                  </span>
                </>
              )}
              {!!r.candidacy.cohorteVaeCollective && (
                <>
                  <br />
                  <span>
                    {
                      r.candidacy.cohorteVaeCollective
                        .commanditaireVaeCollective.raisonSociale
                    }{" "}
                    (Cohorte : {r.candidacy.cohorteVaeCollective.nom})
                  </span>
                </>
              )}
            </div>
          }
          endDetail={
            <>
              <div>
                {r.feasibilityFileSentAt &&
                  `Dossier envoyé le ${format(r.feasibilityFileSentAt, "d MMM yyyy")}`}
              </div>
              <div>
                {r.dossierDeValidationSentAt &&
                  `Dossier de validation envoyé le ${format(r.dossierDeValidationSentAt, "d MMM yyyy")}`}
              </div>
              <div>
                {r.dateOfSession &&
                  `Jury programmé le ${format(r.dateOfSession, "d MMM yyyy")}`}
              </div>
            </>
          }
          linkProps={{
            href: searchResultLink(r.candidacy.id),
          }}
          key={r.id}
          enlargeLink
        />
      )}
    </SearchList>
  );
};
