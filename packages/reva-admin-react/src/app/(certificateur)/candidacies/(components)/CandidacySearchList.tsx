import Card from "@codegouvfr/react-dsfr/Card";
import Tag from "@codegouvfr/react-dsfr/Tag";
import { format, isAfter } from "date-fns";

import {
  CandidacyStatusTag,
  DropoutCandidacyStatus,
  JuryCandidacyStatus,
} from "@/components/candidacy-status-tag/CandidacyStatusTag";
import {
  SearchList,
  SearchListProps,
} from "@/components/search/search-list/SearchList";

import {
  CandidacyStatus,
  CandidacyStatusStep,
  TypeAccompagnement,
} from "@/graphql/generated/graphql";

type CandidacySearchResult<T> = T & {
  id: string;
  feasibilityFileSentAt?: number | null;
  dossierDeValidationSentAt?: number | null;
  dateOfSession?: number | null;
  candidacy: {
    id: string;
    typeAccompagnement: TypeAccompagnement;
    status: CandidacyStatusStep;
    candidacyStatuses: Omit<CandidacyStatus, "id">[];
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
      {(r) => {
        const currentStatus = r.candidacy.status;
        const previousStatus = r.candidacy.candidacyStatuses.sort((a, b) =>
          isAfter(a.createdAt, b.createdAt) ? 1 : -1,
        )[1]?.status;

        return (
          <Card
            title={`${r.candidacy.candidate?.firstname} ${r.candidacy.candidate?.lastname}`}
            shadow
            size="small"
            start={
              <div className="flex flex-row gap-2 mb-2">
                {r.candidacy.typeAccompagnement == "AUTONOME" && (
                  <Tag small>Autonome</Tag>
                )}

                {r.candidacy.typeAccompagnement == "ACCOMPAGNE" && (
                  <Tag small>Accompagné</Tag>
                )}

                {!!r.candidacy.cohorteVaeCollective && (
                  <Tag small>VAE Collective</Tag>
                )}

                {currentStatus != "ARCHIVE" && (
                  <CandidacyStatusTag
                    status={r.candidacy.status}
                    jury={r.candidacy.jury}
                  />
                )}

                {currentStatus === "ARCHIVE" && previousStatus && (
                  <CandidacyStatusTag
                    status={previousStatus}
                    jury={r.candidacy.jury}
                  />
                )}

                {!!r.candidacy.candidacyDropOut && (
                  <Tag small>Candidature abandonnée</Tag>
                )}

                {currentStatus === "ARCHIVE" && (
                  <Tag small>Candidature archivée</Tag>
                )}
              </div>
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
        );
      }}
    </SearchList>
  );
};
