import { Card } from "@codegouvfr/react-dsfr/Card";
import { Pagination } from "@codegouvfr/react-dsfr/Pagination";
import { format } from "date-fns";

import { getAccessTokenFromCookie } from "@/helpers/auth/get-access-token-from-cookie/getAccessTokenFromCookie";
import { throwUrqlErrors } from "@/helpers/graphql/throw-urql-errors/throwUrqlErrors";
import { client } from "@/helpers/graphql/urql-client/urqlClient";

import { graphql } from "@/graphql/generated";

const RECORDS_PER_PAGE = 10;

const loadCommanditaires = async ({
  commanditairesPage = 1,
}: {
  commanditairesPage?: number;
}) => {
  const accessToken = await getAccessTokenFromCookie();

  const result = throwUrqlErrors(
    await client.query(
      graphql(`
        query commanditaireVaeCollectivesForCommanditairesPage(
          $offset: Int!
          $limit: Int!
        ) {
          vaeCollective_commanditaireVaeCollectives(
            offset: $offset
            limit: $limit
          ) {
            info {
              totalRows
            }
            rows {
              id
              raisonSociale
              createdAt
            }
          }
        }
      `),
      {
        offset: (commanditairesPage - 1) * RECORDS_PER_PAGE,
        limit: RECORDS_PER_PAGE,
      },
      {
        fetchOptions: { headers: { Authorization: `Bearer ${accessToken}` } },
      },
    ),
  );
  return result.data?.vaeCollective_commanditaireVaeCollectives;
};

export default async function CommanditairesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;

  const currentPage = page ? Number(page) : 1;

  const commanditaires = await loadCommanditaires({
    commanditairesPage: currentPage,
  });

  if (!commanditaires) {
    throw new Error("Erreur lors du chargement des commanditaires");
  }

  return (
    <div className="fr-container flex flex-col">
      <h1 className="mb-12">Porteurs de projet VAE collective</h1>

      <ul className="flex flex-col gap-4 list-none px-0 my-0">
        {commanditaires.rows.map((commanditaire) => {
          return (
            <li key={commanditaire.id}>
              <Card
                data-testid={"commanditaire-card"}
                enlargeLink
                size="small"
                title={commanditaire.raisonSociale}
                linkProps={{
                  href: `/commanditaires/${commanditaire.id}/cohortes`,
                }}
                endDetail={`Créé le ${format(commanditaire.createdAt, "dd/MM/yyyy")}`}
              />
            </li>
          );
        })}
      </ul>

      <Pagination
        classes={{
          root: "mt-12 ml-auto",
        }}
        showFirstLast={false}
        defaultPage={currentPage}
        count={Math.ceil(commanditaires.info.totalRows / RECORDS_PER_PAGE)}
        getPageLinkProps={(page) => ({
          href: `/commanditaires?page=${page}`,
        })}
      />
    </div>
  );
}
