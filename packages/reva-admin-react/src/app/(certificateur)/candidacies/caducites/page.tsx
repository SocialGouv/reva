"use client";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { CandidacyCaduciteStatus } from "@/graphql/generated/graphql";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { CandidacySearchList } from "../(components)/CandidacySearchList";

const RECORDS_PER_PAGE = 10;

const getCandidacyCaducitesQuery = graphql(`
  query getCandidacyCaducites(
    $offset: Int
    $limit: Int
    $searchFilter: String
    $status: CandidacyCaduciteStatus!
  ) {
    candidacy_getCandidacyCaducites(
      limit: $limit
      offset: $offset
      searchFilter: $searchFilter
      status: $status
    ) {
      rows {
        id
        feasibility {
          feasibilityFileSentAt
        }
        candidate {
          firstname
          lastname
          department {
            code
            label
          }
        }
        certification {
          label
        }
        lastActivityDate
      }
      info {
        totalRows
        totalPages
        currentPage
      }
    }
  }
`);

const CaducitesPage = () => {
  const { graphqlClient } = useGraphQlClient();

  const currentPathname = usePathname();
  const searchParams = useSearchParams();
  const page = searchParams.get("page");
  const currentPage = page ? Number.parseInt(page) : 1;
  const searchFilter = searchParams.get("search") || "";

  const status = searchParams.get("CATEGORY");

  const { replace } = useRouter();

  useEffect(() => {
    if (!status) {
      return;
    }
    const params = new URLSearchParams();
    const validStatus = ["CADUQUE", "CONTESTATION"].includes(status)
      ? status
      : "CADUQUE";
    params.set("CATEGORY", validStatus);
    params.set("page", page || "1");

    if (!page || status !== validStatus) {
      replace(`${currentPathname}?${params.toString()}`);
    }
  }, [replace, page, status, currentPathname]);

  const { data: getCandidacyCaducitesResponse } = useQuery({
    queryKey: ["getCandidacyCaducites", searchFilter, currentPage, status],
    queryFn: () =>
      graphqlClient.request(getCandidacyCaducitesQuery, {
        offset: (currentPage - 1) * RECORDS_PER_PAGE,
        limit: RECORDS_PER_PAGE,
        searchFilter,
        status: status as CandidacyCaduciteStatus,
      }),
    enabled: !!status,
  });

  const caducitesPage =
    getCandidacyCaducitesResponse?.candidacy_getCandidacyCaducites;

  const statusLabel = useMemo(() => {
    switch (status) {
      case "CADUQUE":
        return "Recevabilités caduques";
      case "CONTESTATION":
        return "Contestations caducité";
      default:
        return status;
    }
  }, [status]);

  return (
    caducitesPage && (
      <div className="flex flex-col">
        <h1>Espace certificateur</h1>

        <CandidacySearchList
          title={statusLabel}
          searchFilter={searchFilter}
          searchResultsPage={{
            ...caducitesPage,
            rows: caducitesPage.rows.map((row) => ({
              id: row.id,
              candidacy: {
                id: row.id,
                certification: row.certification,
                candidate: row.candidate,
                feasibility: row.feasibility,
              },
            })),
          }}
          searchResultLink={(candidacyId) =>
            `/candidacies/${candidacyId}/feasibility`
          }
        >
          {(r) =>
            r.candidacy.feasibility?.feasibilityFileSentAt && (
              <p className="text-lg col-span-2 mb-0">
                Dossier envoyé le{" "}
                {format(
                  r.candidacy.feasibility.feasibilityFileSentAt,
                  "dd/MM/yyyy",
                )}
              </p>
            )
          }
        </CandidacySearchList>
      </div>
    )
  );
};

export default CaducitesPage;
