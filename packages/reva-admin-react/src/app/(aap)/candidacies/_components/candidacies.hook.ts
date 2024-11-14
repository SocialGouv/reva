import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { CandidacyStatusFilter } from "@/graphql/generated/graphql";
import { useQuery } from "@tanstack/react-query";

const getCandidacyByStatusCount = graphql(`
  query getCandidacyByStatusCount($searchFilter: String, $maisonMereAAPId: ID) {
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
      DEMANDE_FINANCEMENT_ENVOYE_HORS_ABANDON
      DEMANDE_PAIEMENT_ENVOYEE_HORS_ABANDON
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
      CADUQUE
    }
  }
`);

const getCandidaciesByStatus = graphql(`
  query getCandidaciesByStatus(
    $searchFilter: String
    $statusFilter: CandidacyStatusFilter
    $offset: Int
    $maisonMereAAPId: ID
  ) {
    getCandidacies(
      searchFilter: $searchFilter
      statusFilter: $statusFilter
      limit: 10
      offset: $offset
      maisonMereAAPId: $maisonMereAAPId
    ) {
      rows {
        id
        candidate {
          firstname
          lastname
          department {
            label
            code
          }
        }
        certification {
          label
        }
        organism {
          label
          informationsCommerciales {
            nom
          }
        }
        financeModule
        candidacyStatuses {
          status
          createdAt
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
  currentPage,
  maisonMereAAPId,
}: {
  searchFilter: string;
  statusFilter: CandidacyStatusFilter;
  currentPage: number;
  maisonMereAAPId?: string;
}) => {
  const RECORDS_PER_PAGE = 10;
  const { graphqlClient } = useGraphQlClient();
  const { isFeatureActive } = useFeatureflipping();
  const offset = (currentPage - 1) * RECORDS_PER_PAGE;
  const { data: getCandidacyByStatusResponse } = useQuery({
    queryKey: ["getCandidacyByStatusCount", searchFilter, maisonMereAAPId],
    queryFn: () =>
      graphqlClient.request(getCandidacyByStatusCount, {
        searchFilter,
        maisonMereAAPId,
      }),
    enabled: !isFeatureActive("DISABLE_CANDIDACIES_PAGE_COUNTERS"),
  });

  const { data: getCandidaciesByStatusResponse } = useQuery({
    queryKey: [
      "getCandidaciesByStatus",
      searchFilter,
      statusFilter,
      currentPage,
      maisonMereAAPId,
    ],
    queryFn: () =>
      graphqlClient.request(getCandidaciesByStatus, {
        searchFilter,
        statusFilter,
        offset,
        maisonMereAAPId,
      }),
  });

  const candidaciesByStatusCount =
    getCandidacyByStatusResponse?.candidacy_candidacyCountByStatus;
  const candidaciesByStatus = getCandidaciesByStatusResponse?.getCandidacies;

  return {
    candidaciesByStatusCount,
    candidaciesByStatus,
  };
};
