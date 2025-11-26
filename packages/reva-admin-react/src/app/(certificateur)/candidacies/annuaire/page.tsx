"use client";
import DsfrPagination from "@codegouvfr/react-dsfr/Pagination";
import SearchBar from "@codegouvfr/react-dsfr/SearchBar";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { SearchResultsHeader } from "@/components/search-results-header/SearchResultsHeader";

import { TypeAccompagnement } from "@/graphql/generated/graphql";

import { useAnnuaire } from "./_components/annuaire.hook";
import { CandidacyCard } from "./_components/CandidacyCard";
import { CandidacyCardSkeleton } from "./_components/CandidacyCardSkeleton";
import { FiltersSection } from "./_components/FiltersSection";

export default function AnnuairePage() {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const {
    candidacies,
    isLoading,
    filters,
    searchFilter,
    setSearchFilter: onSearchFilterChange,
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
  } = useAnnuaire();

  const [localSearchFilter, setLocalSearchFilter] = useState(searchFilter);

  const searchParamsWithoutPage = useMemo<Record<string, string>>(() => {
    let params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      if (key.toLowerCase() !== "page") {
        params = { ...params, [key]: value };
      }
    });
    return params;
  }, [searchParams]);

  const buildPageHref = (page: number) => {
    const params = new URLSearchParams(searchParamsWithoutPage);
    params.set("page", String(page));
    const queryString = params.toString();

    return queryString ? `${pathname}?${queryString}` : pathname;
  };

  useEffect(() => {
    setLocalSearchFilter(searchFilter);
  }, [searchFilter]);

  return (
    <div className="mx-auto max-w-[1248px]">
      <h1 className="mb-10">Candidatures</h1>
      <div className="mb-10 bg-white px-6 py-8 shadow-lifted">
        <SearchBar
          label="Rechercher"
          allowEmptySearch
          big
          onButtonClick={() => onSearchFilterChange(localSearchFilter)}
          renderInput={({ className, id, placeholder, type }) => (
            <input
              className={className}
              id={id}
              placeholder={placeholder}
              type={type}
              value={localSearchFilter}
              onChange={(e) => setLocalSearchFilter(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== "Enter") {
                  return;
                }

                onSearchFilterChange(localSearchFilter);
                e.preventDefault();
                e.stopPropagation();
              }}
            />
          )}
        />
      </div>
      <div className="flex gap-6">
        <FiltersSection
          filters={filters}
          cohortes={cohortes}
          onToggleFeasibilityStatus={toggleFeasibilityStatus}
          onToggleValidationStatus={toggleValidationStatus}
          onToggleJuryStatus={toggleJuryStatus}
          onToggleJuryResult={toggleJuryResult}
          onToggleMultipleJuryResults={toggleMultipleJuryResults}
          onToggleCohorte={toggleCohorte}
          onToggleIncludeDropouts={toggleIncludeDropouts}
          onClearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />
        <div className="flex-1">
          <div className="flex flex-col">
            <SearchResultsHeader
              className="mb-4"
              defaultSearchFilter={searchFilter}
              onSearchFilterChange={onSearchFilterChange}
              resultCount={candidacies?.info.totalRows || 0}
              addButton={undefined}
            />

            <ul data-testid="results" className="my-0 flex flex-col gap-5 pl-0">
              {isLoading
                ? Array.from({ length: 10 }).map((_, index) => (
                    <CandidacyCardSkeleton key={index} />
                  ))
                : candidacies?.rows.map((candidacy) => (
                    <CandidacyCard
                      key={candidacy.id}
                      candidateFullName={
                        candidacy.candidate?.firstname +
                        " " +
                        candidacy.candidate?.lastname
                      }
                      cohorteVaeCollective={
                        candidacy.cohorteVaeCollective
                          ?.commanditaireVaeCollective
                          ? (candidacy.cohorteVaeCollective as {
                              nom: string;
                              commanditaireVaeCollective: {
                                raisonSociale: string;
                              };
                            })
                          : null
                      }
                      certificationCode={
                        candidacy.certification?.codeRncp || ""
                      }
                      certificationLabel={candidacy.certification?.label || ""}
                      organismLabel={candidacy.organism?.label || ""}
                      typeAccompagnement={
                        candidacy.typeAccompagnement as TypeAccompagnement
                      }
                      status={candidacy.status}
                      statusHistory={candidacy.candidacyStatuses}
                      jury={candidacy.jury}
                      dropout={candidacy.candidacyDropOut}
                      departmentLabel={
                        candidacy.candidate?.department?.label || ""
                      }
                      candidacyId={candidacy.id}
                      searchResultLink={() =>
                        "/candidacies/" + candidacy.id + "/feasibility"
                      }
                    />
                  ))}
            </ul>

            <br />

            {candidacies?.info && (
              <div className="mx-auto my-12 flex">
                <DsfrPagination
                  defaultPage={candidacies.info.currentPage}
                  count={candidacies.info.totalPages}
                  getPageLinkProps={(page) => ({
                    href: buildPageHref(page),
                  })}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
