"use client";
import SearchBar from "@codegouvfr/react-dsfr/SearchBar";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Pagination } from "@/components/pagination/Pagination";
import { SearchResultsHeader } from "@/components/search-results-header/SearchResultsHeader";

import {
  CandidacySortByFilter,
  CandidacyStatusFilter,
} from "@/graphql/generated/graphql";

import { useAnnuaire } from "./_components/annuaire.hook";
import { CandidacyCard } from "./_components/CandidacyCard";
import { FiltersSection } from "./_components/FiltersSection";

export default function AnnuairePage() {
  const searchParams = useSearchParams();
  const paramsSearchFilter = searchParams.get("search") || "";
  const [searchFilter, setSearchFilter] = useState(paramsSearchFilter);
  const pathname = usePathname();
  const router = useRouter();
  const statusFilter =
    (searchParams.get("status") as CandidacyStatusFilter) ||
    "ACTIVE_HORS_ABANDON";
  const sortByFilter =
    (searchParams.get("sortBy") as CandidacySortByFilter) ||
    "DATE_CREATION_DESC";
  const currentPage = searchParams.get("page")
    ? parseInt(searchParams.get("page") as string)
    : 1;
  const { candidaciesForAnnuaire, paginationInfo } = useAnnuaire({
    searchFilter: paramsSearchFilter,
    statusFilter: statusFilter,
    sortByFilter: sortByFilter,
    currentPage: currentPage,
  });

  const searchParamsWithoutPage = useMemo(() => {
    let params = {};
    searchParams.forEach((value, key) => {
      if (key.toLowerCase() !== "page") {
        params = { ...params, [key]: value };
      }
    });
    return params;
  }, [searchParams]);

  useEffect(() => {
    setSearchFilter(paramsSearchFilter);
  }, [paramsSearchFilter]);

  const onSearchFilterChange = useCallback(
    (filter: string) => {
      const queryParams = new URLSearchParams(searchParams);
      if (filter && queryParams.get("page")) {
        queryParams.set("page", "1");
        queryParams.set("search", filter);
      } else if (filter) {
        queryParams.set("search", filter);
      } else {
        queryParams.delete("search");
      }

      const path = `${pathname}?${queryParams.toString()}`;
      router.push(path);
    },
    [pathname, router, searchParams],
  );

  return (
    <div>
      <h1 className="mb-10">Candidatures</h1>
      <div className="bg-white px-8 py-6 mb-10 shadow-lifted">
        <SearchBar
          label="Rechercher"
          allowEmptySearch
          big
          onButtonClick={() => onSearchFilterChange(searchFilter)}
          renderInput={({ className, id, placeholder, type }) => (
            <input
              className={className}
              id={id}
              placeholder={placeholder}
              type={type}
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== "Enter") {
                  return;
                }

                onSearchFilterChange(searchFilter);
                e.preventDefault();
                e.stopPropagation();
              }}
            />
          )}
        />
      </div>
      <div className="flex gap-4">
        <FiltersSection />
        <div className="w-3/4">
          <div className="flex flex-col">
            <SearchResultsHeader
              className="mt-2 mb-4"
              defaultSearchFilter={paramsSearchFilter}
              onSearchFilterChange={onSearchFilterChange}
              resultCount={paginationInfo?.totalRows || 0}
              addButton={undefined}
            />

            <ul data-testid="results" className="flex flex-col gap-5 my-0 pl-0">
              {candidaciesForAnnuaire?.rows.map((candidacy) => (
                <CandidacyCard
                  key={candidacy.id}
                  candidateFullName={
                    candidacy.candidate?.firstname +
                    " " +
                    candidacy.candidate?.lastname
                  }
                  cohorteVaeCollective={candidacy.cohorteVaeCollective || null}
                  certificationCode={candidacy.certification?.codeRncp || ""}
                  certificationLabel={candidacy.certification?.label || ""}
                  organismLabel={candidacy.organism?.label || ""}
                  organismModalitateAccompagnement={
                    candidacy.organism?.modaliteAccompagnement || ""
                  }
                  candidacyStatus={candidacy.status}
                  jury={candidacy.jury}
                  dropout={candidacy.candidacyDropOut}
                  feasibilityFileSentAt={
                    candidacy.feasibility?.feasibilityFileSentAt || null
                  }
                  dossierDeValidationSentAt={
                    candidacy.activeDossierDeValidation
                      ?.dossierDeValidationSentAt || null
                  }
                  dateOfSession={candidacy.jury?.dateOfSession || null}
                  departmentLabel={candidacy.candidate?.department?.label || ""}
                  candidacyId={candidacy.id}
                  searchResultLink={() =>
                    "/candidacies/" + candidacy.id + "/feasibility"
                  }
                />
              ))}
            </ul>

            <br />

            {paginationInfo && (
              <Pagination
                totalPages={paginationInfo.totalPages}
                currentPage={paginationInfo.currentPage}
                baseHref={pathname}
                className="mx-auto my-12"
                baseParams={searchParamsWithoutPage}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
