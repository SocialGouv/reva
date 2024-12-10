"use client";
import { WhiteCard } from "@/components/card/white-card/WhiteCard";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { SearchList } from "@/components/search/search-list/SearchList";
import { graphql } from "@/graphql/generated";
import { CertificationStatusV2 } from "@/graphql/generated/graphql";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { format } from "date-fns";
import Badge from "@codegouvfr/react-dsfr/Badge";

const getCertificationsQuery = graphql(`
  query getCertificationsV2ForListPage(
    $offset: Int
    $searchFilter: String
    $status: CertificationStatusV2
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
        statusV2
        visible
        certificationAuthorityStructure {
          label
        }
        expiresAt
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
        status: status as CertificationStatusV2,
        visible,
      }),
  });

  const certificationPage =
    getCertificationsResponse?.searchCertificationsForAdmin;

  return (
    certificationPage && (
      <div className="flex flex-col w-full">
        <h1>Gestion des certifications</h1>
        {getCertificationsQueryStatus === "success" && (
          <SearchList
            title={`Certifications ${
              status
                ? status === "AVAILABLE"
                  ? "disponibles"
                  : "inactives"
                : ""
            }`}
            searchFilter={searchFilter}
            searchResultsPage={certificationPage}
          >
            {(c) => (
              <WhiteCard key={c.id} className="gap-2">
                <div className="flex flex-row justify-between items-center">
                  <span className="text-gray-500 text-sm">{c.codeRncp}</span>
                  <BadgeCertificationStatus
                    status={c.statusV2}
                    visible={c.visible}
                  />
                </div>
                <span className="text-lg font-bold">{c.label}</span>
                <span>{c.certificationAuthorityStructure?.label}</span>
                <span>Expire le: {format(c.expiresAt, "dd/MM/yyyy")}</span>
                <Button
                  data-test="access-certification-button"
                  className="mt-2 ml-auto"
                  linkProps={{
                    href: `/certifications/${c.id}`,
                  }}
                >
                  Accéder à la certification
                </Button>
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
  status: CertificationStatusV2;
  visible: boolean;
}) => (
  <>
    {status == "BROUILLON" && (
      <Badge
        noIcon
        severity="new"
        data-test="certification-timeline-element-brouillon-badge"
      >
        BROUILLON
      </Badge>
    )}

    {status == "A_VALIDER_PAR_CERTIFICATEUR" && (
      <Badge
        noIcon
        severity="info"
        data-test="certification-timeline-element-envoye-pour-validation-badge"
      >
        ENVOYÉ POUR VALIDATION
      </Badge>
    )}

    {((status == "VALIDE_PAR_CERTIFICATEUR" && !visible) ||
      status == "INACTIVE") && (
      <Badge
        noIcon
        severity="warning"
        data-test="certification-timeline-element-invisible-badge"
      >
        INVISIBLE
      </Badge>
    )}

    {status == "VALIDE_PAR_CERTIFICATEUR" && visible && (
      <Badge
        noIcon
        severity="success"
        data-test="certification-timeline-element-visible-badge"
      >
        VISIBLE
      </Badge>
    )}
  </>
);

export default CertificationListPage;
