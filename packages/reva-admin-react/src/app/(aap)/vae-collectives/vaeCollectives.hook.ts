import { useQuery } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";
import { CandidacyStatusFilter } from "@/graphql/generated/graphql";

const getCohortesQuery = graphql(`
  query getCohortesForVaeCollectivesPage {
    cohortesVaeCollectivesForConnectedAap {
      id
      nom
    }
  }
`);

const getCandidaciesQuery = graphql(`
  query getCandidaciesForVaeCollectivesPage(
    $cohorteId: ID!
    $status: CandidacyStatusFilter
    $limit: Int!
    $offset: Int!
    $searchFilter: String!
  ) {
    getCandidacies(
      cohorteVaeCollectiveId: $cohorteId
      statusFilter: $status
      limit: $limit
      offset: $offset
      searchFilter: $searchFilter
    ) {
      rows {
        id
        candidate {
          firstname
          lastname
          givenName
          department {
            label
            code
          }
        }
        certification {
          label
          codeRncp
        }
        organism {
          label
          nomPublic
          modaliteAccompagnement
        }
        financeModule
        candidacyStatuses {
          status
          createdAt
        }
        status
        feasibility {
          dematerializedFeasibilityFile {
            sentToCandidateAt
            isReadyToBeSentToCertificationAuthority
            isReadyToBeSentToCandidate
            candidateConfirmationAt
            swornStatementFileId
          }
          decision
          feasibilityFileSentAt
        }
        candidacyDropOut {
          createdAt
        }
        jury {
          dateOfSession
          result
        }
        cohorteVaeCollective {
          nom
          nom
          commanditaireVaeCollective {
            raisonSociale
          }
        }
      }
      info {
        currentPage
        totalPages
        totalRows
      }
    }
  }
`);

const getCandidacyCountByStatusQuery = graphql(`
  query getCandidacyCountByStatusForVaeCollectivesPage($cohorteId: ID!) {
    candidacy_candidacyCountByStatus(cohorteVaeCollectiveId: $cohorteId) {
      ACTIVE_HORS_ABANDON
      DOSSIER_FAISABILITE_NON_RECEVABLE_HORS_ABANDON
      DOSSIER_DE_VALIDATION_ENVOYE_HORS_ABANDON
      DOSSIER_DE_VALIDATION_SIGNALE_HORS_ABANDON
      JURY_HORS_ABANDON
      JURY_PROGRAMME_HORS_ABANDON
      JURY_PASSE_HORS_ABANDON
      VALIDATION_HORS_ABANDON
      PROJET_HORS_ABANDON
      ABANDON
      REORIENTEE
      ARCHIVE_HORS_ABANDON_HORS_REORIENTATION
      PARCOURS_CONFIRME_HORS_ABANDON
      PRISE_EN_CHARGE_HORS_ABANDON
      PARCOURS_ENVOYE_HORS_ABANDON
      DOSSIER_FAISABILITE_ENVOYE_HORS_ABANDON
      DOSSIER_FAISABILITE_RECEVABLE_HORS_ABANDON
      DOSSIER_FAISABILITE_INCOMPLET_HORS_ABANDON
      VAE_COLLECTIVE
      DEMANDE_FINANCEMENT_ENVOYEE
      DEMANDE_PAIEMENT_ENVOYEE
      DEMANDE_PAIEMENT_A_ENVOYER
      END_ACCOMPAGNEMENT
    }
  }
`);

export const useVAECollectivesPage = ({
  cohorteId,
  status,
  page = 1,
  searchFilter = "",
}: {
  cohorteId?: string | null;
  status?: CandidacyStatusFilter | null;
  page?: number;
  searchFilter?: string;
}) => {
  const RECORDS_PER_PAGE = 10;
  const offset = (page - 1) * RECORDS_PER_PAGE;

  const { graphqlClient } = useGraphQlClient();

  const { data: getCohortesResponse } = useQuery({
    queryKey: ["getCohortesForVaeCollectivesPage"],
    queryFn: () => graphqlClient.request(getCohortesQuery),
  });

  const { data: getCandidaciesResponse } = useQuery({
    queryKey: [
      cohorteId,
      status,
      page,
      searchFilter,
      "getCandidaciesForVaeCollectivesPage",
    ],
    queryFn: () =>
      graphqlClient.request(getCandidaciesQuery, {
        cohorteId: cohorteId ?? "",
        status: status ?? "ACTIVE_HORS_ABANDON",
        offset,
        limit: RECORDS_PER_PAGE,
        searchFilter,
      }),
    enabled: !!cohorteId && !!status,
  });

  const { data: getCandidacyCountByStatusResponse } = useQuery({
    queryKey: [cohorteId, "getCandidacyCountByStatusForVaeCollectivesPage"],
    queryFn: () =>
      graphqlClient.request(getCandidacyCountByStatusQuery, {
        cohorteId: cohorteId ?? "",
      }),
    enabled: !!cohorteId,
  });

  const cohortes = getCohortesResponse?.cohortesVaeCollectivesForConnectedAap;
  const candidacies = getCandidaciesResponse?.getCandidacies;
  const candidacyCountByStatus =
    getCandidacyCountByStatusResponse?.candidacy_candidacyCountByStatus;

  return {
    cohortes,
    candidacies,
    candidacyCountByStatus,
  };
};
