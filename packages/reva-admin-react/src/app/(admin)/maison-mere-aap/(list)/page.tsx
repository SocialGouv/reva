"use client";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

import { WhiteCard } from "@/components/card/white-card/WhiteCard";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { SearchList } from "@/components/search/search-list/SearchList";

import { graphql } from "@/graphql/generated";

const getMaisonMereAAPs = graphql(`
  query getMaisonMereAAPs($offset: Int, $searchFilter: String) {
    organism_getMaisonMereAAPs(
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
const MaisonMereAapListPage = () => {
  const { graphqlClient } = useGraphQlClient();

  const searchParams = useSearchParams();
  const page = searchParams.get("page");
  const currentPage = page ? Number.parseInt(page) : 1;
  const searchFilter = searchParams.get("search") || "";

  const { data, status } = useQuery({
    queryKey: ["getMaisonMereAAPs", searchFilter, currentPage],
    queryFn: () =>
      graphqlClient.request(getMaisonMereAAPs, {
        offset: (currentPage - 1) * RECORDS_PER_PAGE,
        searchFilter,
      }),
  });

  if (status === "error") {
    return (
      <div>
        Une erreur est survenue lors du chargement des structures
        accompagnatrices.
      </div>
    );
  }

  if (status === "pending") {
    return <div className="min-h-[720px]"></div>;
  }

  return (
    <div className="flex flex-col">
      <h1>Structures accompagnatrices</h1>
      <p className="text-xl leading-8 mb-12">
        En tant qu'administrateur, vous avez la possibilité de visualiser
        l’intégralité des structures accompagnatrices (anciennement appelées
        Maisons Mères) ainsi que les informations relatives aux comptes
        collaborateurs qui y sont rattachés.
      </p>
      {status === "success" && (
        <SearchList
          searchBarProps={{
            placeholder: "Recherchez par nom, numéro SIRET, adresse email etc.",
          }}
          searchFilter={searchFilter}
          searchResultsPage={data.organism_getMaisonMereAAPs}
        >
          {(organism) =>
            organism ? (
              <WhiteCard key={organism.id}>
                <h6 className="mb-3">{organism.raisonSociale}</h6>
                <Button
                  className="place-self-end"
                  linkProps={{
                    href: `/maison-mere-aap/${organism.id}`,
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
};

export default MaisonMereAapListPage;
