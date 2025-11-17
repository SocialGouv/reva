"use client";
import SearchBar from "@codegouvfr/react-dsfr/SearchBar";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Pagination } from "@/components/pagination/Pagination";
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
    setLocalSearchFilter(searchFilter);
  }, [searchFilter]);

  return (
    <div>
      <h1 className="mb-10">Candidatures</h1>
      <div className="bg-white px-8 py-6 mb-10 shadow-lifted">
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
      <div className="flex gap-4">
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
        <div className="w-3/4">
          <div className="flex flex-col">
            <SearchResultsHeader
              className="mt-2 mb-4"
              defaultSearchFilter={searchFilter}
              onSearchFilterChange={onSearchFilterChange}
              resultCount={candidacies?.info.totalRows || 0}
              addButton={undefined}
            />

            <ul data-testid="results" className="flex flex-col gap-5 my-0 pl-0">
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
                      feasibilityFileSentAt={
                        candidacy.feasibility?.feasibilityFileSentAt || null
                      }
                      dossierDeValidationSentAt={
                        candidacy.activeDossierDeValidation
                          ?.dossierDeValidationSentAt || null
                      }
                      dateOfSession={candidacy.jury?.dateOfSession || null}
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
              <Pagination
                totalPages={candidacies.info.totalPages}
                currentPage={candidacies.info.currentPage}
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
