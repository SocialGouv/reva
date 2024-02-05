"use client";
import { useAuth } from "@/components/auth/auth";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { PageTitle } from "@/components/page/page-title/PageTitle";
import { graphql } from "@/graphql/generated";
import {
  DossierDeValidationCategoryFilter,
  DossierDeValidationPage,
} from "@/graphql/generated/graphql";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { CandidacySearchList } from "../(components)/CandidacySearchList";
import { useSearchFilterFeasibilitiesStore } from "../(components)/useSearchFilterFeasibilitiesStore";

const RECORDS_PER_PAGE = 10;

const getDossiersDeValidationQuery = graphql(`
  query getDossiersDeValidation(
    $offset: Int
    $limit: Int
    $searchFilter: String
    $categoryFilter: DossierDeValidationCategoryFilter
  ) {
    dossierDeValidation_getDossiersDeValidation(
      categoryFilter: $categoryFilter
      limit: $limit
      offset: $offset
      searchFilter: $searchFilter
    ) {
      rows {
        id
        candidacy {
          id
          certification {
            label
          }
          candidate {
            firstname
            lastname
          }
          department {
            label
            code
          }
        }
        dossierDeValidationFile {
          url
          name
        }
        dossierDeValidationOtherFiles {
          url
          name
        }
        dossierDeValidationSentAt
        decisionComment
        decisionSentAt
        isActive
        createdAt
        updatedAt
      }
      info {
        totalRows
        totalPages
        currentPage
      }
    }
  }
`);

const DossiersDeValidationPage = () => {
  const { graphqlClient } = useGraphQlClient();
  const { searchFilter, setSearchFilter } = useSearchFilterFeasibilitiesStore();
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const page = params.get("page");
  const category = params.get("CATEGORY");
  const currentPage = page ? Number.parseInt(page) : 1;
  const { isAdmin } = useAuth();

  const updateSearchFilter = (newSearchFilter: string) => {
    setSearchFilter(newSearchFilter);
    router.push(`${pathname}?CATEGORY=${category || "ALL"}`);
  };

  const { data: getDossiersDeValidationResponse } = useQuery({
    queryKey: ["getDossiersDeValidation", searchFilter, currentPage, category],
    queryFn: () =>
      graphqlClient.request(getDossiersDeValidationQuery, {
        offset: (currentPage - 1) * RECORDS_PER_PAGE,
        limit: RECORDS_PER_PAGE,
        searchFilter,
        categoryFilter: (category === null || category === "ALL"
          ? undefined
          : category) as DossierDeValidationCategoryFilter,
      }),
  });

  const dossierDeValidationPage =
    getDossiersDeValidationResponse?.dossierDeValidation_getDossiersDeValidation;

  const categoryLabel = useMemo(() => {
    switch (category) {
      case "PENDING":
        return "Dossiers de validation en attente";
      case "INCOMPLETE":
        return "Dossiers de validation signalés";
      default:
        return "Tous les dossiers de validation";
    }
  }, [category]);
  return (
    dossierDeValidationPage && (
      <div className="flex flex-col">
        {!isAdmin && <PageTitle>Espace certificateur</PageTitle>}
        <CandidacySearchList
          categoryLabel={categoryLabel}
          searchFilter={searchFilter}
          updateSearchFilter={updateSearchFilter}
          searchResults={dossierDeValidationPage as DossierDeValidationPage}
          currentPage={currentPage}
          searchResultLink={(searchResult) =>
            `/candidacies/${searchResult.candidacyId}/dossier-de-validation`
          }
        />
      </div>
    )
  );
};

export default DossiersDeValidationPage;
