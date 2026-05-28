import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";
import {
  CandidacySortByFilter,
  CandidacyStatusStep,
  FeasibilityStatusFilter,
  DossierDeValidationStatusFilter,
  JuryStatusFilter,
} from "@/graphql/generated/graphql";

export interface AnnuaireFilters {
  candidacyStatuses: CandidacyStatusStep[];
  trainingStatuses: CandidacyStatusStep[];
  feasibilityStatuses: FeasibilityStatusFilter[];
  dossierDeValidationStatuses: DossierDeValidationStatusFilter[];
  juryStatuses: JuryStatusFilter[];
}

const getCandidaciesForAAP = graphql(`
  query getCandidaciesForAAP(
    $offset: Int
    $searchFilter: String
    $sortByFilter: CandidacySortByFilter
    $candidacyStatuses: [CandidacyStatusStep!]
    $trainingStatuses: [CandidacyStatusStep!]
    $feasibilityStatuses: [FeasibilityStatusFilter!]
    $dossierDeValidationStatuses: [DossierDeValidationStatusFilter!]
    $juryStatuses: [JuryStatusFilter!]
  ) {
    candidacy_getCandidaciesForAAP(
      offset: $offset
      limit: 10
      searchFilter: $searchFilter
      sortByFilter: $sortByFilter
      candidacyStatuses: $candidacyStatuses
      trainingStatuses: $trainingStatuses
      feasibilityStatuses: $feasibilityStatuses
      dossierDeValidationStatuses: $dossierDeValidationStatuses
      juryStatuses: $juryStatuses
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
        feasibility {
          feasibilityFileSentAt
        }
        activeDossierDeValidation {
          dossierDeValidationSentAt
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
    const candidacyParam = searchParams.get("candidacy");
    const trainingParam = searchParams.get("training");
    const feasibilityParam = searchParams.get("feasibility");
    const dossierDeValidationParam = searchParams.get("dossierDeValidation");
    const juryParam = searchParams.get("juryStatuses");

    return {
      candidacyStatuses: candidacyParam
        ? (candidacyParam.split(",") as CandidacyStatusStep[])
        : [],
      trainingStatuses: trainingParam
        ? (trainingParam.split(",") as CandidacyStatusStep[])
        : [],
      feasibilityStatuses: feasibilityParam
        ? (feasibilityParam.split(",") as FeasibilityStatusFilter[])
        : [],
      dossierDeValidationStatuses: dossierDeValidationParam
        ? (dossierDeValidationParam.split(
            ",",
          ) as DossierDeValidationStatusFilter[])
        : [],
      juryStatuses: juryParam
        ? (juryParam.split(",") as JuryStatusFilter[])
        : [],
    };
  }, [searchParams]);

  const searchFilter = searchParams.get("search") || "";
  const sortByFilter =
    (searchParams.get("sortBy") as CandidacySortByFilter) ||
    "DATE_CREATION_DESC";
  const currentPage = searchParams.get("page")
    ? parseInt(searchParams.get("page") as string)
    : 1;

  const offset = (currentPage - 1) * 10;

  const { data, isLoading } = useQuery({
    queryKey: [
      "candidacy_getCandidaciesForAAP",
      searchFilter,
      sortByFilter,
      currentPage,
      filters.candidacyStatuses,
      filters.trainingStatuses,
      filters.feasibilityStatuses,
      filters.dossierDeValidationStatuses,
      filters.juryStatuses,
    ],
    queryFn: () =>
      graphqlClient.request(getCandidaciesForAAP, {
        offset,
        searchFilter,
        sortByFilter,
        candidacyStatuses:
          filters.candidacyStatuses.length > 0
            ? filters.candidacyStatuses
            : undefined,
        trainingStatuses:
          filters.trainingStatuses.length > 0
            ? filters.trainingStatuses
            : undefined,
        feasibilityStatuses:
          filters.feasibilityStatuses.length > 0
            ? filters.feasibilityStatuses
            : undefined,
        dossierDeValidationStatuses:
          filters.dossierDeValidationStatuses.length > 0
            ? filters.dossierDeValidationStatuses
            : undefined,
        juryStatuses:
          filters.juryStatuses.length > 0 ? filters.juryStatuses : undefined,
      }),
  });

  const updateFilters = useCallback(
    (newFilters: Partial<AnnuaireFilters>) => {
      const queryParams = new URLSearchParams(searchParams);
      queryParams.set("page", "1");

      if (newFilters.candidacyStatuses !== undefined) {
        if (newFilters.candidacyStatuses.length > 0) {
          queryParams.set("candidacy", newFilters.candidacyStatuses.join(","));
        } else {
          queryParams.delete("candidacy");
        }
      }

      if (newFilters.trainingStatuses !== undefined) {
        if (newFilters.trainingStatuses.length > 0) {
          queryParams.set("training", newFilters.trainingStatuses.join(","));
        } else {
          queryParams.delete("training");
        }
      }

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

      if (newFilters.dossierDeValidationStatuses !== undefined) {
        if (newFilters.dossierDeValidationStatuses.length > 0) {
          queryParams.set(
            "dossierDeValidation",
            newFilters.dossierDeValidationStatuses.join(","),
          );
        } else {
          queryParams.delete("dossierDeValidation");
        }
      }

      if (newFilters.juryStatuses !== undefined) {
        if (newFilters.juryStatuses.length > 0) {
          queryParams.set("juryStatuses", newFilters.juryStatuses.join(","));
        } else {
          queryParams.delete("juryStatuses");
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

  const toggleCandidacyStatus = useCallback(
    (status: CandidacyStatusStep) => {
      const newStatuses = filters.candidacyStatuses.includes(status)
        ? filters.candidacyStatuses.filter((s) => s !== status)
        : [...filters.candidacyStatuses, status];
      updateFilters({ candidacyStatuses: newStatuses });
    },
    [filters.candidacyStatuses, updateFilters],
  );

  const toggleTrainingStatus = useCallback(
    (status: CandidacyStatusStep) => {
      const newStatuses = filters.trainingStatuses.includes(status)
        ? filters.trainingStatuses.filter((s) => s !== status)
        : [...filters.trainingStatuses, status];
      updateFilters({ trainingStatuses: newStatuses });
    },
    [filters.trainingStatuses, updateFilters],
  );

  const toggleFeasibilityStatus = useCallback(
    (status: FeasibilityStatusFilter) => {
      const newStatuses = filters.feasibilityStatuses.includes(status)
        ? filters.feasibilityStatuses.filter((s) => s !== status)
        : [...filters.feasibilityStatuses, status];
      updateFilters({ feasibilityStatuses: newStatuses });
    },
    [filters.feasibilityStatuses, updateFilters],
  );

  const toggleDossierDeValidationStatus = useCallback(
    (status: DossierDeValidationStatusFilter) => {
      const newStatuses = filters.dossierDeValidationStatuses.includes(status)
        ? filters.dossierDeValidationStatuses.filter((s) => s !== status)
        : [...filters.dossierDeValidationStatuses, status];
      updateFilters({ dossierDeValidationStatuses: newStatuses });
    },
    [filters.dossierDeValidationStatuses, updateFilters],
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

  const clearFilters = useCallback(() => {
    const queryParams = new URLSearchParams(searchParams);
    queryParams.delete("candidacy");
    queryParams.delete("training");
    queryParams.delete("feasibility");
    queryParams.delete("dossierDeValidation");
    queryParams.delete("juryStatuses");
    queryParams.set("page", "1");
    router.replace(`${pathname}?${queryParams.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  const hasActiveFilters = useMemo(
    () =>
      filters.candidacyStatuses.length > 0 ||
      filters.trainingStatuses.length > 0 ||
      filters.feasibilityStatuses.length > 0 ||
      filters.dossierDeValidationStatuses.length > 0 ||
      filters.juryStatuses.length > 0,
    [
      filters.candidacyStatuses,
      filters.trainingStatuses,
      filters.feasibilityStatuses,
      filters.dossierDeValidationStatuses,
      filters.juryStatuses,
    ],
  );

  return {
    candidacies: data?.candidacy_getCandidaciesForAAP,
    isLoading,
    filters,
    searchFilter,
    setSearchFilter,
    toggleCandidacyStatus,
    toggleTrainingStatus,
    toggleFeasibilityStatus,
    toggleDossierDeValidationStatus,
    toggleJuryStatus,
    clearFilters,
    hasActiveFilters,
  };
};
