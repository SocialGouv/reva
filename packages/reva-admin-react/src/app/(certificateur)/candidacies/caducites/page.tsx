"use client";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { CandidacyCaduciteStatus } from "@/graphql/generated/graphql";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { CandidacySearchList } from "../(components)/CandidacySearchList";
import { useAuth } from "@/components/auth/auth";
import Button from "@codegouvfr/react-dsfr/Button";

const RECORDS_PER_PAGE = 10;

const getCandidacyCaducitesQuery = graphql(`
  query getCandidacyCaducites(
    $offset: Int
    $limit: Int
    $searchFilter: String
    $certificationAuthorityId: ID
    $certificationAuthorityLocalAccountId: ID
    $status: CandidacyCaduciteStatus!
  ) {
    candidacy_getCandidacyCaducites(
      limit: $limit
      offset: $offset
      searchFilter: $searchFilter
      certificationAuthorityId: $certificationAuthorityId
      certificationAuthorityLocalAccountId: $certificationAuthorityLocalAccountId
      status: $status
    ) {
      rows {
        id
        feasibility {
          feasibilityFileSentAt
        }
        status
        candidacyDropOut {
          createdAt
        }
        jury {
          dateOfSession
          result
        }
        cohorteVaeCollective {
          nom
          projetVaeCollective {
            nom
            commanditaireVaeCollective {
              raisonSociale
            }
          }
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
          codeRncp
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
  const certificationAuthorityId = searchParams.get(
    "certificationAuthorityId",
  ) as string | undefined;
  const certificationAuthorityLocalAccountId = searchParams.get(
    "certificationAuthorityLocalAccountId",
  ) as string | undefined;

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

  const { isAdmin } = useAuth();

  const { data: getCandidacyCaducitesResponse } = useQuery({
    queryKey: [
      "getCandidacyCaducites",
      searchFilter,
      certificationAuthorityId,
      certificationAuthorityLocalAccountId,
      currentPage,
      status,
    ],
    queryFn: () =>
      graphqlClient.request(getCandidacyCaducitesQuery, {
        offset: (currentPage - 1) * RECORDS_PER_PAGE,
        limit: RECORDS_PER_PAGE,
        searchFilter,
        certificationAuthorityId,
        certificationAuthorityLocalAccountId,
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

  const getPathnameWithoutCertificationAuthorityId = (): string => {
    const currentParams = new URLSearchParams(searchParams);
    currentParams.delete("certificationAuthorityId");
    return `${currentPathname}?${currentParams.toString()}`;
  };

  const getPathnameWithoutCertificationAuthorityLocalAccountId = (): string => {
    const currentParams = new URLSearchParams(searchParams);
    currentParams.delete("certificationAuthorityLocalAccountId");
    return `${currentPathname}?${currentParams.toString()}`;
  };

  return (
    caducitesPage && (
      <div className="flex flex-col">
        {isAdmin ? (
          <>
            {certificationAuthorityId && (
              <div>
                <h1>Candidatures de la structure</h1>
                <Button
                  priority="secondary"
                  linkProps={{
                    href: getPathnameWithoutCertificationAuthorityId(),
                  }}
                >
                  Accéder à toutes les candidatures
                </Button>
                <p className="mt-6">
                  Ici, vous pouvez rechercher une ou plusieurs candidatures
                  gérées par cette structure. Pour retrouver toutes les
                  candidatures de la plateforme, cliquez sur “Accéder à toutes
                  les candidatures”.
                </p>
              </div>
            )}

            {certificationAuthorityLocalAccountId && (
              <div>
                <h1>Candidatures du compte collaborateur</h1>
                <Button
                  priority="secondary"
                  linkProps={{
                    href: getPathnameWithoutCertificationAuthorityLocalAccountId(),
                  }}
                >
                  Accéder à toutes les candidatures
                </Button>
                <p className="mt-6">
                  Ici, vous pouvez rechercher une ou plusieurs candidatures
                  gérées par ce compte collaborateur. Pour retrouver toutes les
                  candidatures de la plateforme, cliquez sur “Accéder à toutes
                  les candidatures”.
                </p>
              </div>
            )}

            {!certificationAuthorityId &&
              !certificationAuthorityLocalAccountId && <h1>Candidatures</h1>}
          </>
        ) : (
          <h1>Candidatures</h1>
        )}

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
                jury: row.jury,
                dropout: row.candidacyDropOut,
                status: row.status,
                cohorteVaeCollective: row.cohorteVaeCollective,
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
