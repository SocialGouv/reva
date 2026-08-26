import { redirect } from "next/navigation";

import { RoleDependentBreadcrumb } from "@/components/role-dependent-breadcrumb/RoleDependentBreadcrumb";
import { getAccessTokenFromCookie } from "@/helpers/auth/get-access-token-from-cookie/getAccessTokenFromCookie";
import { throwUrqlErrors } from "@/helpers/graphql/throw-urql-errors/throwUrqlErrors";
import { client } from "@/helpers/graphql/urql-client/urqlClient";

import { graphql } from "@/graphql/generated";

const loadFirstSousCompte = async ({
  commanditaireVaeCollectiveId,
}: {
  commanditaireVaeCollectiveId: string;
}) => {
  const accessToken = await getAccessTokenFromCookie();

  const result = throwUrqlErrors(
    await client.query(
      graphql(`
        query commanditaireVaeCollectiveForComptesUtilisateurPage(
          $commanditaireVaeCollectiveId: ID!
        ) {
          vaeCollective_getCommanditaireVaeCollective(
            commanditaireVaeCollectiveId: $commanditaireVaeCollectiveId
          ) {
            id
            sousComptes(offset: 0, limit: 1) {
              rows {
                id
              }
            }
          }
        }
      `),
      { commanditaireVaeCollectiveId },
      {
        fetchOptions: { headers: { Authorization: `Bearer ${accessToken}` } },
      },
    ),
  );

  return result.data?.vaeCollective_getCommanditaireVaeCollective?.sousComptes
    .rows[0];
};

export default async function ComptesUtilisateurPage({
  params,
}: {
  params: Promise<{ commanditaireId: string }>;
}) {
  const { commanditaireId } = await params;

  const firstSousCompte = await loadFirstSousCompte({
    commanditaireVaeCollectiveId: commanditaireId,
  });

  if (!firstSousCompte) {
    redirect(
      `/commanditaires/${commanditaireId}/comptes-utilisateur/aucun-compte-utilisateur/`,
    );
  }

  return (
    <div className="flex flex-col">
      <RoleDependentBreadcrumb
        className="mt-0 mb-4"
        currentPageLabel="Gestion des comptes"
        segments={[]}
      />

      <h1>Gestion des comptes</h1>
    </div>
  );
}
