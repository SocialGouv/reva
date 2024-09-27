"use client";
import { SearchList } from "@/components/search/search-list/SearchList";
import {
  CandidacyCountByStatus,
  CandidacyStatusFilter,
} from "@/graphql/generated/graphql";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import {
  CandidaciesLayout,
  CandidacyCard,
  useCandidacies,
} from "./_components";
import Button from "@codegouvfr/react-dsfr/Button";

export default function CandidaciesPage() {
  const pathname = usePathname();
  const { replace } = useRouter();

  const searchParams = useSearchParams();
  const page = searchParams.get("page");
  const currentPage = page ? Number.parseInt(page) : 1;
  const searchFilter = searchParams.get("search") || "";
  const status = searchParams.get("status");
  const maisonMereAAPId = searchParams.get("maisonMereAAPId") as
    | string
    | undefined;

  const params = useMemo(
    () => new URLSearchParams(searchParams),
    [searchParams],
  );

  const { candidaciesByStatusCount, candidaciesByStatus } = useCandidacies({
    searchFilter,
    statusFilter: (status as CandidacyStatusFilter) ?? "ACTIVE_HORS_ABANDON",
    currentPage,
    maisonMereAAPId,
  });

  useEffect(() => {
    if (!status) {
      params.set("status", "ACTIVE_HORS_ABANDON");
    }
    if (!page) {
      params.set("page", "1");
    }

    replace(`${pathname}?${params.toString()}`);
  }, [status, params, pathname, replace, page]);

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
            et faire une recherche par architecte de parcours.
          </p>
        </div>
      )}
      {candidaciesByStatus && (
        <SearchList
          searchFilter={searchFilter}
          searchResultsPage={candidaciesByStatus}
        >
          {(candidacy) => (
            <CandidacyCard
              key={candidacy.id}
              candidacyId={candidacy.id}
              candidateFirstname={candidacy.candidate?.firstname || ""}
              candidateLastname={candidacy.candidate?.lastname || ""}
              certificationLabel={candidacy?.certification?.label}
              departmentCode={candidacy.department?.code}
              departmentLabel={candidacy.department?.label}
              organismLabel={
                candidacy.organism?.informationsCommerciales?.nom ||
                candidacy.organism?.label
              }
              candidacySentAt={
                candidacy.candidacyStatuses.some(
                  (s) => s.status === "VALIDATION",
                )
                  ? new Date(
                      candidacy.candidacyStatuses.find(
                        (s) => s.status === "VALIDATION",
                      )?.createdAt || 0,
                    )
                  : undefined
              }
              fundable={candidacy.financeModule !== "hors_plateforme"}
            />
          )}
        </SearchList>
      )}
    </CandidaciesLayout>
  );
}
