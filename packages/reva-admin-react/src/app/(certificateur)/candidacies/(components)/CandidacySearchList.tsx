import Card from "@codegouvfr/react-dsfr/Card";
import Tag from "@codegouvfr/react-dsfr/Tag";
import { format } from "date-fns";

import {
  CandidacyStatusTag,
  DropoutCandidacyStatus,
  JuryCandidacyStatus,
} from "@/components/candidacy-status-tag/CandidacyStatusTag";
import {
  SearchList,
  SearchListProps,
} from "@/components/search/search-list/SearchList";

import { CandidacyStatusStep } from "@/graphql/generated/graphql";

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
    jury?: JuryCandidacyStatus;
    candidacyDropOut?: DropoutCandidacyStatus;
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
                <CandidacyStatusTag
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
