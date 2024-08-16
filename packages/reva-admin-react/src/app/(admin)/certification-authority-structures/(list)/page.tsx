"use client";
import { WhiteCard } from "@/components/card/white-card/WhiteCard";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { Pagination } from "@/components/pagination/Pagination";
import { graphql } from "@/graphql/generated";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

const getCertificationAuthorityStructures = graphql(`
  query getCertificationAuthorityStructures($offset: Int) {
    certification_authority_getCertificationAuthorityStructures(
      limit: 10
      offset: $offset
    ) {
      rows {
        id
        label
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

const CertificationAuthorityStructuresListPage = () => {
  const { graphqlClient } = useGraphQlClient();

  const searchParams = useSearchParams();
  const page = searchParams.get("page");
  const currentPage = page ? Number.parseInt(page) : 1;

  const {
    data: getCertificationAuthorityStructuresResponse,
    status: getCertificationAuthorityStructuresStatus,
  } = useQuery({
    queryKey: ["getCertificationAuthorityStructures", currentPage],
    queryFn: () =>
      graphqlClient.request(getCertificationAuthorityStructures, {
        offset: (currentPage - 1) * RECORDS_PER_PAGE,
      }),
  });

  const certificationAuthorityStructuresPage =
    getCertificationAuthorityStructuresResponse?.certification_authority_getCertificationAuthorityStructures;
  return (
    certificationAuthorityStructuresPage && (
      <div className="flex flex-col flex-1">
        <h1>Annuaire certificateurs</h1>
        {getCertificationAuthorityStructuresStatus === "success" && (
          <>
            <span className="text-xs mb-1">
              {certificationAuthorityStructuresPage.info.totalRows} résultats
            </span>
            <ul className="flex flex-col gap-2 pl-0">
              {certificationAuthorityStructuresPage.rows.map((c) => (
                <WhiteCard key={c.id}>
                  <span className="font-bold">{c.label}</span>
                  <Button
                    className="ml-auto"
                    linkProps={{
                      href: `/certification-authority-structures/${c.id}`,
                    }}
                  >
                    Voir plus
                  </Button>
                </WhiteCard>
              ))}
            </ul>
            <br />
            <Pagination
              totalPages={certificationAuthorityStructuresPage.info.totalPages}
              currentPage={
                certificationAuthorityStructuresPage.info.currentPage
              }
              baseHref="/certification-authority-structures"
              className="mx-auto"
            />
          </>
        )}
      </div>
    )
  );
};

export default CertificationAuthorityStructuresListPage;
