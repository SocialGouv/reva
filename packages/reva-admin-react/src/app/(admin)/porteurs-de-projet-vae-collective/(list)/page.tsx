"use client";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

import { WhiteCard } from "@/components/card/white-card/WhiteCard";
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

  return (
    <div className="flex flex-col w-full">
      <h1>Porteurs de projet VAE collective</h1>
      <p className="text-xl leading-8 mb-12">
        En tant qu'administrateur, vous avez la possibilité de visualiser
        l’intégralité des porteurs de projet VAE collective.
      </p>
      {status === "success" && (
        <SearchList
          searchBarProps={{
            title: "Recherchez par raison sociale",
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
              <WhiteCard key={commanditaire.id}>
                <h6 className="mb-3">{commanditaire.raisonSociale}</h6>
                <Button
                  className="place-self-end"
                  linkProps={{
                    href: `/vae-collective/commanditaires/${commanditaire.id}/cohortes`,
                  }}
                >
                  Voir plus
                </Button>
              </WhiteCard>
            ) : null
          }
        </SearchList>
      )}
    </div>
  );
}
