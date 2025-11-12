import { useQuery } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";
import {
  CandidacySortByFilter,
  CandidacyStatusFilter,
  PaginationInfo,
} from "@/graphql/generated/graphql";

const getCandidaciesForAnnuaire = graphql(`
  query getCandidaciesForAnnuaire(
    $searchFilter: String
    $statusFilter: CandidacyStatusFilter
    $sortByFilter: CandidacySortByFilter
    $offset: Int
    $cohorteVaeCollectiveId: ID
    $certificationAuthorityId: ID
  ) {
    candidacy_getCandidaciesForCertificationAuthority(
      searchFilter: $searchFilter
      statusFilter: $statusFilter
      sortByFilter: $sortByFilter
      limit: 10
      offset: $offset
      certificationAuthorityId: $certificationAuthorityId
      cohorteVaeCollectiveId: $cohorteVaeCollectiveId
    ) {
      rows {
        id
        candidate {
          firstname
          lastname
          department {
            label
          }
        }
        cohorteVaeCollective {
          nom
          commanditaireVaeCollective {
            raisonSociale
          }
        }
        feasibility {
          feasibilityFileSentAt
        }
        activeDossierDeValidation {
          dossierDeValidationSentAt
        }
        jury {
          id
          dateOfSession
          result
        }
        certification {
          label
          codeRncp
        }
        organism {
          label
          modaliteAccompagnement
        }
        candidacyDropOut {
          createdAt
        }
        status
      }
      info {
        totalRows
        totalPages
        currentPage
      }
    }
  }
`);

export const useAnnuaire = ({
  searchFilter,
  statusFilter,
  sortByFilter,
  currentPage,
  cohorteVaeCollectiveId,
  certificationAuthorityId,
}: {
  searchFilter: string;
  statusFilter: CandidacyStatusFilter;
  sortByFilter: CandidacySortByFilter;
  currentPage: number;
  certificationAuthorityId?: string;
  cohorteVaeCollectiveId?: string;
}) => {
  const { graphqlClient } = useGraphQlClient();
  const offset = (currentPage - 1) * 10;
  const { data: candidacy_getCandidaciesForCertificationAuthorityResponse } =
    useQuery({
      queryKey: [
        "candidacy_getCandidaciesForCertificationAuthority",
        searchFilter,
        statusFilter,
        sortByFilter,
        currentPage,
        certificationAuthorityId,
        cohorteVaeCollectiveId,
      ],
      queryFn: () =>
        graphqlClient.request(getCandidaciesForAnnuaire, {
          searchFilter,
          statusFilter,
          sortByFilter,
          offset,
          certificationAuthorityId,
          cohorteVaeCollectiveId,
        }),
    });

  const candidaciesForAnnuaire =
    candidacy_getCandidaciesForCertificationAuthorityResponse?.candidacy_getCandidaciesForCertificationAuthority;
  const paginationInfo =
    (candidacy_getCandidaciesForCertificationAuthorityResponse
      ?.candidacy_getCandidaciesForCertificationAuthority
      ?.info as PaginationInfo) || undefined;

  return {
    candidaciesForAnnuaire,
    paginationInfo,
  };
};
