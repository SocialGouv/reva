"use client";
import { SearchList } from "@/components/search/search-list/SearchList";
import {
  CandidacyCountByStatus,
  CandidacyStatusFilter,
  CandidacySummary,
} from "@/graphql/generated/graphql";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  CandidaciesLayout,
  CandidacyCard,
  useCandidacies,
} from "./_components";

export default function CandidaciesPage() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const page = searchParams.get("page");
  const currentPage = page ? Number.parseInt(page) : 1;
  const status = searchParams.get("status");
  const [searchFilter, setSearchFilter] = useState("");

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
          updateSearchFilter={setSearchFilter}
          searchResultsPage={candidaciesByStatus}
        >
          {(candidacy) => (
            <CandidacyCard candidacy={candidacy as CandidacySummary} />
          )}
        </SearchList>
      )}
    </CandidaciesLayout>
  );
}
