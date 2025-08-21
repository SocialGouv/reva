"use client";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Card } from "@codegouvfr/react-dsfr/Card";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useSearchParams } from "next/navigation";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { SearchList } from "@/components/search/search-list/SearchList";

import { graphql } from "@/graphql/generated";

const getVaeCollectives = graphql(`
  query getVaeCollectivesForPorteursDeProjetVaeCollectivePage(
    $offset: Int
    $searchFilter: String
  ) {
    vaeCollective_commanditaireVaeCollectives(
      limit: 10
      offset: $offset
      searchFilter: $searchFilter
    ) {
      rows {
        id
        raisonSociale
        createdAt
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

export default function PorteursDeProjetVaeCollectiveListPage() {
  const { graphqlClient } = useGraphQlClient();

  const searchParams = useSearchParams();
  const page = searchParams.get("page");
  const currentPage = page ? Number.parseInt(page) : 1;
  const searchFilter = searchParams.get("search") || "";

  const { data, status } = useQuery({
    queryKey: ["getVaeCollectives", searchFilter, currentPage],
    queryFn: () =>
      graphqlClient.request(getVaeCollectives, {
        offset: (currentPage - 1) * RECORDS_PER_PAGE,
        searchFilter,
      }),
  });

  if (status === "error") {
    return <div>Une erreur est survenue lors du chargement de la page</div>;
  }

  if (status === "pending") {
    return <div className="min-h-[720px]"></div>;
  }

  const vaeCollectiveBaseUrl =
    process.env.NODE_ENV === "production" ? "/../" : "http://localhost:3005";

  return (
    <div className="flex flex-col w-full">
      <h1>Porteurs de projet VAE collective</h1>
      {status === "success" && (
        <SearchList
          searchBarProps={{
            placeholder: "Recherchez par raison sociale",
          }}
          searchFilter={searchFilter}
          searchResultsPage={data.vaeCollective_commanditaireVaeCollectives}
          addButton={
            <Button
              priority="tertiary no outline"
              size="small"
              iconId="fr-icon-add-line"
              linkProps={{
                href: "/porteurs-de-projet-vae-collective/add",
              }}
            >
              Ajouter un porteur de projet VAE collective
            </Button>
          }
        >
          {(commanditaire) =>
            commanditaire ? (
              <li className="list-none">
                <Card
                  key={commanditaire.id}
                  title={commanditaire.raisonSociale}
                  size="small"
                  enlargeLink
                  endDetail={`Créé le ${format(commanditaire.createdAt, "dd/MM/yyyy")}`}
                  linkProps={{
                    target: "_self",
                    href: `${vaeCollectiveBaseUrl}/vae-collective/client-auth-redirect?redirectAfterAuthUrl=/commanditaires/${commanditaire.id}/cohortes`,
                  }}
                />
              </li>
            ) : null
          }
        </SearchList>
      )}
    </div>
  );
}
