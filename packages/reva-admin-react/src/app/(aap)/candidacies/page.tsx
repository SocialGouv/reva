"use client";

import Button from "@codegouvfr/react-dsfr/Button";
import { toDate } from "date-fns";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";

import { CandidacyCard } from "@/components/card/candidacy-card/CandidacyCard";
import { SearchList } from "@/components/search/search-list/SearchList";

import {
  CandidacyCountByStatus,
  CandidacySortByFilter,
  CandidacyStatusFilter,
} from "@/graphql/generated/graphql";

import { useCandidacies } from "./_components/candidacies.hook";
import { CandidaciesLayout } from "./_components/CandidaciesLayout";
import { FilterBar } from "./_components/FilterBar";

export default function CandidaciesPage() {
  const pathname = usePathname();
  const { replace } = useRouter();

  const searchParams = useSearchParams();
  const page = searchParams.get("page");
  const currentPage = page ? Number.parseInt(page) : 1;
  const searchFilter = searchParams.get("search") || "";
  const status = searchParams.get("status");
  const sortByFilter = searchParams.get("sortBy");
  const maisonMereAAPId = searchParams.get("maisonMereAAPId") as
    | string
    | undefined;
  const cohorteVaeCollectiveId = searchParams.get("cohorteVaeCollectiveId") as
    | string
    | undefined;

  const params = useMemo(
    () => new URLSearchParams(searchParams),
    [searchParams],
  );

  const {
    candidaciesByStatusCount,
    candidaciesByStatus,
    cohortesVaeCollectives,
  } = useCandidacies({
    searchFilter,
    statusFilter: (status as CandidacyStatusFilter) ?? "ACTIVE_HORS_ABANDON",
    sortByFilter:
      (sortByFilter as CandidacySortByFilter) ?? "DATE_CREATION_DESC",
    currentPage,
    maisonMereAAPId,
    cohorteVaeCollectiveId,
  });

  useEffect(() => {
    if (!status) {
      params.set("status", "ACTIVE_HORS_ABANDON");
    }
    if (!sortByFilter) {
      params.set("sortBy", "DATE_CREATION_DESC");
    }
    if (!page) {
      params.set("page", "1");
    }

    replace(`${pathname}?${params.toString()}`);
  }, [status, params, pathname, replace, page, sortByFilter]);

  const getPathnameWithoutMaisonMereAAPId = (): string => {
    const currentParams = new URLSearchParams(searchParams);
    currentParams.delete("maisonMereAAPId");
    return `${pathname}?${currentParams.toString()}`;
  };

  return (
    <CandidaciesLayout
      candidaciesByStatusCount={
        candidaciesByStatusCount as CandidacyCountByStatus
      }
      cohortesVaeCollectives={cohortesVaeCollectives}
    >
      {maisonMereAAPId ? (
        <div>
          <h1>Candidatures de la structure</h1>
          <Button
            priority="secondary"
            linkProps={{
              href: getPathnameWithoutMaisonMereAAPId(),
            }}
          >
            Accéder à toutes les candidatures
          </Button>
          <p className="mt-6">
            Ici, vous pouvez rechercher une ou plusieurs candidatures gérées par
            cette structure. Pour retrouver toutes les candidatures de la
            plateforme, cliquez sur “Accéder à toutes les candidatures”.
          </p>
        </div>
      ) : (
        <div>
          <h1>Espace pro administrateur</h1>
          <p>
            En tant qu'administrateur, vous pouvez gérer toutes les candidatures
            et faire une recherche par Architecte Accompagnateur de Parcours.
          </p>
        </div>
      )}

      {candidaciesByStatus && (
        <SearchList
          searchFilter={searchFilter}
          searchResultsPage={candidaciesByStatus}
          FilterBar={<FilterBar />}
        >
          {(candidacy) => (
            <CandidacyCard
              key={candidacy.id}
              candidacyId={candidacy.id}
              candidateFirstname={candidacy.candidate?.firstname || ""}
              candidateLastname={candidacy.candidate?.lastname || ""}
              candidateGivenName={candidacy.candidate?.givenName || undefined}
              certificationLabel={
                candidacy.certification
                  ? `RNCP ${candidacy?.certification.codeRncp} : ${candidacy?.certification?.label}`
                  : undefined
              }
              departmentCode={candidacy.candidate?.department?.code}
              departmentLabel={candidacy.candidate?.department?.label}
              organismLabel={
                candidacy.organism?.nomPublic || candidacy.organism?.label
              }
              organismModalitateAccompagnement={
                candidacy.organism?.modaliteAccompagnement
              }
              candidacySentAt={
                candidacy.candidacyStatuses.some(
                  (s) => s.status === "VALIDATION",
                )
                  ? toDate(
                      candidacy.candidacyStatuses.find(
                        (s) => s.status === "VALIDATION",
                      )?.createdAt || 0,
                    )
                  : undefined
              }
              fundable={candidacy.financeModule !== "hors_plateforme"}
              vaeCollective={!!candidacy.cohorteVaeCollective}
              vaeCollectiveCommanditaireLabel={
                candidacy.cohorteVaeCollective?.commanditaireVaeCollective
                  .raisonSociale
              }
              vaeCollectiveCohortLabel={candidacy.cohorteVaeCollective?.nom}
              status={candidacy.status}
              feasibility={candidacy.feasibility}
              jury={candidacy.jury}
              dropout={candidacy.candidacyDropOut}
            />
          )}
        </SearchList>
      )}
    </CandidaciesLayout>
  );
}
