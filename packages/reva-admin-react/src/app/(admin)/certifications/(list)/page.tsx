"use client";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useSearchParams } from "next/navigation";

import { useAuth } from "@/components/auth/auth";
import { WhiteCard } from "@/components/card/white-card/WhiteCard";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { SearchList } from "@/components/search/search-list/SearchList";

import { graphql } from "@/graphql/generated";
import { CertificationStatus } from "@/graphql/generated/graphql";

const getCertificationsQuery = graphql(`
  query getCertificationsV2ForListPage(
    $offset: Int
    $searchFilter: String
    $status: CertificationStatus
    $visible: Boolean
  ) {
    searchCertificationsForAdmin(
      limit: 10
      offset: $offset
      searchText: $searchFilter
      status: $status
      visible: $visible
    ) {
      rows {
        id
        label
        codeRncp
        status
        visible
        certificationAuthorityStructure {
          label
        }
        rncpExpiresAt
      }
      info {
        totalRows
        totalPages
        currentPage
      }
    }
  }
`);

const RECORDS_PER_PAGE = 10;
const CertificationListPage = () => {
  const { graphqlClient } = useGraphQlClient();
  const { isAdmin } = useAuth();
  const searchParams = useSearchParams();
  const page = searchParams.get("page");
  const currentPage = page ? Number.parseInt(page) : 1;
  const searchFilter = searchParams.get("search") || "";
  const status = searchParams.get("status");
  const stringParam = searchParams.get("visible");
  const visible =
    stringParam === "true" ? true : stringParam === "false" ? false : undefined;

  const {
    data: getCertificationsResponse,
    status: getCertificationsQueryStatus,
  } = useQuery({
    queryKey: ["getCertifications", searchFilter, currentPage, status, visible],
    queryFn: () =>
      graphqlClient.request(getCertificationsQuery, {
        offset: (currentPage - 1) * RECORDS_PER_PAGE,
        searchFilter,
        status: status as CertificationStatus,
        visible,
      }),
  });

  const certificationPage =
    getCertificationsResponse?.searchCertificationsForAdmin;

  return (
    certificationPage && (
      <div className="flex flex-col w-full">
        <h1>Certifications</h1>
        <p>
          Retrouvez ici les certifications liées aux différentes structures
          certificatrices enregistrées sur France VAE.{" "}
        </p>
        {getCertificationsQueryStatus === "success" && (
          <SearchList
            searchFilter={searchFilter}
            searchResultsPage={certificationPage}
          >
            {(c) => (
              <WhiteCard key={c.id} className="gap-2">
                <div className="flex flex-row justify-between items-center">
                  <span className="text-gray-500 text-sm">
                    Code RNCP : {c.codeRncp}
                  </span>
                  <BadgeCertificationStatus
                    status={c.status}
                    visible={c.visible}
                  />
                </div>
                <span className="text-lg font-bold">{c.label}</span>
                <span>{c.certificationAuthorityStructure?.label}</span>
                <span>
                  Date d'échéance : {format(c.rncpExpiresAt, "dd/MM/yyyy")}
                </span>
                <Button
                  data-testid="access-certification-button"
                  className="mt-2 ml-auto"
                  linkProps={{
                    href: `/certifications/${c.id}`,
                  }}
                >
                  Accéder à la certification
                </Button>
                {isAdmin && c.status === "A_VALIDER_PAR_CERTIFICATEUR" && (
                  <Button
                    priority="secondary"
                    className="mt-2 ml-auto"
                    linkProps={{
                      href: `/responsable-certifications/certifications/${c.id}`,
                    }}
                  >
                    Accès certificateur
                  </Button>
                )}
              </WhiteCard>
            )}
          </SearchList>
        )}
      </div>
    )
  );
};

const BadgeCertificationStatus = ({
  status,
  visible,
}: {
  status: CertificationStatus;
  visible: boolean;
}) => (
  <>
    {status == "BROUILLON" && (
      <Badge
        noIcon
        severity="new"
        data-testid="certification-timeline-element-brouillon-badge"
      >
        BROUILLON
      </Badge>
    )}

    {status == "A_VALIDER_PAR_CERTIFICATEUR" && (
      <Badge
        noIcon
        severity="info"
        data-testid="certification-timeline-element-envoye-pour-validation-badge"
      >
        ENVOYÉ POUR VALIDATION
      </Badge>
    )}

    {((status == "VALIDE_PAR_CERTIFICATEUR" && !visible) ||
      status == "INACTIVE") && (
      <Badge
        noIcon
        severity="warning"
        data-testid="certification-timeline-element-invisible-badge"
      >
        INVISIBLE
      </Badge>
    )}

    {status == "VALIDE_PAR_CERTIFICATEUR" && visible && (
      <Badge
        noIcon
        severity="success"
        data-testid="certification-timeline-element-visible-badge"
      >
        VISIBLE
      </Badge>
    )}
  </>
);

export default CertificationListPage;
