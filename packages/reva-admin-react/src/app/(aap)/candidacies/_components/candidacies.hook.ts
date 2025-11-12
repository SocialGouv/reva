import { useQuery } from "@tanstack/react-query";

import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";
import {
  CandidacySortByFilter,
  CandidacyStatusFilter,
} from "@/graphql/generated/graphql";

const getCandidacyByStatusCountAndCohortesVaeCollectives = graphql(`
  query getCandidacyByStatusCountAndCohortesVaeCollectives(
    $searchFilter: String
    $maisonMereAAPId: ID
  ) {
    candidacy_candidacyCountByStatus(
      searchFilter: $searchFilter
      maisonMereAAPId: $maisonMereAAPId
    ) {
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
    cohortesVaeCollectivesForConnectedAap {
      id
      nom
    }
  }
`);

const getCandidaciesByStatus = graphql(`
  query getCandidaciesByStatus(
    $searchFilter: String
    $statusFilter: CandidacyStatusFilter
    $sortByFilter: CandidacySortByFilter
    $offset: Int
    $maisonMereAAPId: ID
    $cohorteVaeCollectiveId: ID
  ) {
    getCandidacies(
      searchFilter: $searchFilter
      statusFilter: $statusFilter
      sortByFilter: $sortByFilter
      limit: 10
      offset: $offset
      maisonMereAAPId: $maisonMereAAPId
      cohorteVaeCollectiveId: $cohorteVaeCollectiveId
    ) {
      rows {
        id
        candidate {
          firstname
          firstname2
          firstname3
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
        totalRows
        totalPages
        currentPage
      }
    }
  }
`);

export const useCandidacies = ({
  searchFilter,
  statusFilter,
  sortByFilter,
  currentPage,
  maisonMereAAPId,
  cohorteVaeCollectiveId,
}: {
  searchFilter: string;
  statusFilter: CandidacyStatusFilter;
  sortByFilter: CandidacySortByFilter;
  currentPage: number;
  maisonMereAAPId?: string;
  cohorteVaeCollectiveId?: string;
}) => {
  const RECORDS_PER_PAGE = 10;
  const { graphqlClient } = useGraphQlClient();
  const { isFeatureActive } = useFeatureflipping();
  const offset = (currentPage - 1) * RECORDS_PER_PAGE;
  const { data: getCandidacyByStatusCountAndCohortesVaeCollectivesResponse } =
    useQuery({
      queryKey: [
        "getCandidacyByStatusCountAndCohortesVaeCollectives",
        searchFilter,
        maisonMereAAPId,
      ],
      queryFn: () =>
        graphqlClient.request(
          getCandidacyByStatusCountAndCohortesVaeCollectives,
          {
            searchFilter,
            maisonMereAAPId,
          },
        ),
      enabled: !isFeatureActive("DISABLE_CANDIDACIES_PAGE_COUNTERS"),
    });

  const { data: getCandidaciesByStatusResponse } = useQuery({
    queryKey: [
      "getCandidaciesByStatus",
      searchFilter,
      statusFilter,
      sortByFilter,
      currentPage,
      maisonMereAAPId,
      cohorteVaeCollectiveId,
    ],
    queryFn: () =>
      graphqlClient.request(getCandidaciesByStatus, {
        searchFilter,
        statusFilter,
        sortByFilter,
        offset,
        maisonMereAAPId,
        cohorteVaeCollectiveId,
      }),
  });

  const candidaciesByStatusCount =
    getCandidacyByStatusCountAndCohortesVaeCollectivesResponse?.candidacy_candidacyCountByStatus;
  const candidaciesByStatus = getCandidaciesByStatusResponse?.getCandidacies;
  const cohortesVaeCollectives =
    getCandidacyByStatusCountAndCohortesVaeCollectivesResponse?.cohortesVaeCollectivesForConnectedAap ||
    [];

  return {
    candidaciesByStatusCount,
    candidaciesByStatus,
    cohortesVaeCollectives,
  };
};
