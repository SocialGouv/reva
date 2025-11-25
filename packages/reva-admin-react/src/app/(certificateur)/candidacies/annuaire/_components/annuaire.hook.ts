import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";
import {
  CandidacySortByFilter,
  CandidacyStatusFilter,
  CandidacyStatusStep,
  JuryResultFilter,
  JuryStatusFilter,
} from "@/graphql/generated/graphql";

export interface AnnuaireFilters {
  feasibilityStatuses: CandidacyStatusStep[];
  validationStatuses: CandidacyStatusStep[];
  juryStatuses: JuryStatusFilter[];
  juryResults: JuryResultFilter[];
  cohorteIds: string[];
  includeDropouts: boolean;
}

const getCohortesForAnnuaire = graphql(`
  query getCohortesForAnnuaire {
    cohortesVaeCollectivesForConnectedCertificationAuthorityOrLocalAccount {
      id
      nom
    }
  }
`);

const getCandidaciesForAnnuaire = graphql(`
  query getCandidaciesForAnnuaire(
    $searchFilter: String
    $statusFilter: CandidacyStatusFilter
    $sortByFilter: CandidacySortByFilter
    $offset: Int
    $cohorteVaeCollectiveId: ID
    $feasibilityStatuses: [CandidacyStatusStep!]
    $validationStatuses: [CandidacyStatusStep!]
    $juryStatuses: [JuryStatusFilter!]
    $juryResults: [JuryResultFilter!]
    $includeDropouts: Boolean
  ) {
    candidacy_getCandidaciesForCertificationAuthority(
      searchFilter: $searchFilter
      statusFilter: $statusFilter
      sortByFilter: $sortByFilter
      limit: 10
      offset: $offset
      cohorteVaeCollectiveId: $cohorteVaeCollectiveId
      feasibilityStatuses: $feasibilityStatuses
      validationStatuses: $validationStatuses
      juryStatuses: $juryStatuses
      juryResults: $juryResults
      includeDropouts: $includeDropouts
    ) {
      rows {
        id
        typeAccompagnement
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
        jury {
          dateOfSession
          result
        }
        certification {
          label
          codeRncp
        }
        organism {
          label
        }
        candidacyDropOut {
          createdAt
        }
        status
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

export const useAnnuaire = () => {
  const { graphqlClient } = useGraphQlClient();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const filters = useMemo<AnnuaireFilters>(() => {
    const feasibilityParam = searchParams.get("feasibility");
    const validationParam = searchParams.get("validation");
    const juryStatusParam = searchParams.get("juryStatus");
    const juryResultParam = searchParams.get("juryResult");
    const cohorteParam = searchParams.get("cohorte");
    const dropoutParam = searchParams.get("dropout");

    return {
      feasibilityStatuses: feasibilityParam
        ? (feasibilityParam.split(",") as CandidacyStatusStep[])
        : [],
      validationStatuses: validationParam
        ? (validationParam.split(",") as CandidacyStatusStep[])
        : [],
      juryStatuses: juryStatusParam
        ? (juryStatusParam.split(",") as JuryStatusFilter[])
        : [],
      juryResults: juryResultParam
        ? (juryResultParam.split(",") as JuryResultFilter[])
        : [],
      cohorteIds: cohorteParam ? cohorteParam.split(",") : [],
      includeDropouts: dropoutParam === "true",
    };
  }, [searchParams]);

  const searchFilter = searchParams.get("search") || "";
  const statusFilter =
    (searchParams.get("status") as CandidacyStatusFilter) ||
    "ACTIVE_HORS_ABANDON";
  const sortByFilter =
    (searchParams.get("sortBy") as CandidacySortByFilter) ||
    "DATE_CREATION_DESC";
  const currentPage = searchParams.get("page")
    ? parseInt(searchParams.get("page") as string)
    : 1;

  const offset = (currentPage - 1) * 10;

  const { data, isLoading } = useQuery({
    queryKey: [
      "candidacy_getCandidaciesForCertificationAuthority",
      searchFilter,
      statusFilter,
      sortByFilter,
      currentPage,
      filters.feasibilityStatuses,
      filters.validationStatuses,
      filters.juryStatuses,
      filters.juryResults,
      filters.cohorteIds,
      filters.includeDropouts,
    ],
    queryFn: () =>
      graphqlClient.request(getCandidaciesForAnnuaire, {
        searchFilter,
        statusFilter,
        sortByFilter,
        offset,
        feasibilityStatuses:
          filters.feasibilityStatuses.length > 0
            ? filters.feasibilityStatuses
            : undefined,
        validationStatuses:
          filters.validationStatuses.length > 0
            ? filters.validationStatuses
            : undefined,
        juryStatuses:
          filters.juryStatuses.length > 0 ? filters.juryStatuses : undefined,
        juryResults:
          filters.juryResults.length > 0 ? filters.juryResults : undefined,
        cohorteVaeCollectiveId:
          filters.cohorteIds.length === 1 ? filters.cohorteIds[0] : undefined,
        includeDropouts: filters.includeDropouts,
      }),
  });

  const { data: cohortesData } = useQuery({
    queryKey: ["getCohortesForAnnuaire"],
    queryFn: () => graphqlClient.request(getCohortesForAnnuaire),
  });

  const cohortes = useMemo(() => {
    return (
      cohortesData?.cohortesVaeCollectivesForConnectedCertificationAuthorityOrLocalAccount ||
      []
    );
  }, [cohortesData]);

  const updateFilters = useCallback(
    (newFilters: Partial<AnnuaireFilters>) => {
      const queryParams = new URLSearchParams(searchParams);
      queryParams.set("page", "1");

      if (newFilters.feasibilityStatuses !== undefined) {
        if (newFilters.feasibilityStatuses.length > 0) {
          queryParams.set(
            "feasibility",
            newFilters.feasibilityStatuses.join(","),
          );
        } else {
          queryParams.delete("feasibility");
        }
      }

      if (newFilters.validationStatuses !== undefined) {
        if (newFilters.validationStatuses.length > 0) {
          queryParams.set(
            "validation",
            newFilters.validationStatuses.join(","),
          );
        } else {
          queryParams.delete("validation");
        }
      }

      if (newFilters.juryStatuses !== undefined) {
        if (newFilters.juryStatuses.length > 0) {
          queryParams.set("juryStatus", newFilters.juryStatuses.join(","));
        } else {
          queryParams.delete("juryStatus");
        }
      }

      if (newFilters.juryResults !== undefined) {
        if (newFilters.juryResults.length > 0) {
          queryParams.set("juryResult", newFilters.juryResults.join(","));
        } else {
          queryParams.delete("juryResult");
        }
      }

      if (newFilters.cohorteIds !== undefined) {
        if (newFilters.cohorteIds.length > 0) {
          queryParams.set("cohorte", newFilters.cohorteIds.join(","));
        } else {
          queryParams.delete("cohorte");
        }
      }

      if (newFilters.includeDropouts !== undefined) {
        if (newFilters.includeDropouts) {
          queryParams.set("dropout", "true");
        } else {
          queryParams.delete("dropout");
        }
      }

      router.replace(`${pathname}?${queryParams.toString()}`, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  const setSearchFilter = useCallback(
    (filter: string) => {
      const queryParams = new URLSearchParams(searchParams);
      if (filter) {
        queryParams.set("page", "1");
        queryParams.set("search", filter);
      } else {
        queryParams.delete("search");
      }
      router.push(`${pathname}?${queryParams.toString()}`);
    },
    [pathname, router, searchParams],
  );

  const toggleFeasibilityStatus = useCallback(
    (status: CandidacyStatusStep) => {
      const newStatuses = filters.feasibilityStatuses.includes(status)
        ? filters.feasibilityStatuses.filter((s) => s !== status)
        : [...filters.feasibilityStatuses, status];
      updateFilters({ feasibilityStatuses: newStatuses });
    },
    [filters.feasibilityStatuses, updateFilters],
  );

  const toggleValidationStatus = useCallback(
    (status: CandidacyStatusStep) => {
      const newStatuses = filters.validationStatuses.includes(status)
        ? filters.validationStatuses.filter((s) => s !== status)
        : [...filters.validationStatuses, status];
      updateFilters({ validationStatuses: newStatuses });
    },
    [filters.validationStatuses, updateFilters],
  );

  const toggleJuryStatus = useCallback(
    (status: JuryStatusFilter) => {
      const newStatuses = filters.juryStatuses.includes(status)
        ? filters.juryStatuses.filter((s) => s !== status)
        : [...filters.juryStatuses, status];
      updateFilters({ juryStatuses: newStatuses });
    },
    [filters.juryStatuses, updateFilters],
  );

  const toggleJuryResult = useCallback(
    (result: JuryResultFilter) => {
      const newResults = filters.juryResults.includes(result)
        ? filters.juryResults.filter((r) => r !== result)
        : [...filters.juryResults, result];
      updateFilters({ juryResults: newResults });
    },
    [filters.juryResults, updateFilters],
  );

  const toggleMultipleJuryResults = useCallback(
    (results: JuryResultFilter[]) => {
      const allSelected = results.every((r) => filters.juryResults.includes(r));
      const newResults = allSelected
        ? filters.juryResults.filter((r) => !results.includes(r))
        : [
            ...filters.juryResults,
            ...results.filter((r) => !filters.juryResults.includes(r)),
          ];
      updateFilters({ juryResults: newResults });
    },
    [filters.juryResults, updateFilters],
  );

  const toggleCohorte = useCallback(
    (cohorteId: string) => {
      const newCohortes = filters.cohorteIds.includes(cohorteId)
        ? filters.cohorteIds.filter((c) => c !== cohorteId)
        : [...filters.cohorteIds, cohorteId];
      updateFilters({ cohorteIds: newCohortes });
    },
    [filters.cohorteIds, updateFilters],
  );

  const toggleIncludeDropouts = useCallback(() => {
    updateFilters({ includeDropouts: !filters.includeDropouts });
  }, [filters.includeDropouts, updateFilters]);

  const clearFilters = useCallback(() => {
    const queryParams = new URLSearchParams(searchParams);
    queryParams.delete("feasibility");
    queryParams.delete("validation");
    queryParams.delete("juryStatus");
    queryParams.delete("juryResult");
    queryParams.delete("cohorte");
    queryParams.delete("dropout");
    queryParams.set("page", "1");
    router.replace(`${pathname}?${queryParams.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  const hasActiveFilters = useMemo(
    () =>
      filters.feasibilityStatuses.length > 0 ||
      filters.validationStatuses.length > 0 ||
      filters.juryStatuses.length > 0 ||
      filters.juryResults.length > 0 ||
      filters.cohorteIds.length > 0 ||
      filters.includeDropouts,
    [filters],
  );

  return {
    candidacies: data?.candidacy_getCandidaciesForCertificationAuthority,
    isLoading,
    filters,
    searchFilter,
    setSearchFilter,
    toggleFeasibilityStatus,
    toggleValidationStatus,
    toggleJuryStatus,
    toggleJuryResult,
    toggleMultipleJuryResults,
    toggleCohorte,
    toggleIncludeDropouts,
    clearFilters,
    hasActiveFilters,
    cohortes,
  };
};
