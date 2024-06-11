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

export default function CandidaciesPage() {
  const pathname = usePathname();
  const { replace } = useRouter();

  const searchParams = useSearchParams();
  const page = searchParams.get("page");
  const currentPage = page ? Number.parseInt(page) : 1;
  const searchFilter = searchParams.get("search") || "";
  const status = searchParams.get("status");

  const params = useMemo(
    () => new URLSearchParams(searchParams),
    [searchParams],
  );

  const { candidaciesByStatusCount, candidaciesByStatus } = useCandidacies({
    searchFilter,
    statusFilter: (status as CandidacyStatusFilter) ?? "ACTIVE_HORS_ABANDON",
    currentPage,
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

  return (
    <CandidaciesLayout
      candidaciesByStatusCount={
        candidaciesByStatusCount as CandidacyCountByStatus
      }
    >
      <h1>Espace pro administrateur</h1>
      <p>
        En tant qu'administrateur, vous pouvez gérer toutes les candidatures et
        faire une recherche par architecte de parcours.
      </p>
      {candidaciesByStatus && (
        <SearchList
          searchFilter={searchFilter}
          searchResultsPage={candidaciesByStatus}
        >
          {(candidacy) => (
            <CandidacyCard
              key={candidacy.id}
              candidacyId={candidacy.id}
              candidateFirstname={candidacy.firstname || ""}
              candidateLastname={candidacy.lastname || ""}
              certificationLabel={candidacy?.certification?.label}
              departmentCode={candidacy.department?.code}
              departmentLabel={candidacy.department?.label}
              organismLabel={
                candidacy.organism?.informationsCommerciales?.nom ||
                candidacy.organism?.label
              }
              candidacySentAt={
                candidacy.sentAt ? new Date(candidacy.sentAt) : undefined
              }
              fundable={candidacy.financeModule !== "hors_plateforme"}
            />
          )}
        </SearchList>
      )}
    </CandidaciesLayout>
  );
}
