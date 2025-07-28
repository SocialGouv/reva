"use server";

import { getAccessTokenFromCookie } from "@/helpers/auth/get-access-token-from-cookie/getAccessTokenFromCookie";
import { throwUrqlErrors } from "@/helpers/graphql/throw-urql-errors/throwUrqlErrors";
import { client } from "@/helpers/graphql/urql-client/urqlClient";

import { graphql } from "@/graphql/generated";

const searchOrganismsAndGetCohorteInfoQuery = graphql(`
  query searchOrganismsAndGetCohorteInfoForSearchAAPPage(
    $commanditaireVaeCollectiveId: ID!
    $cohorteVaeCollectiveId: ID!
    $searchText: String
    $offset: Int
    $limit: Int
  ) {
    vaeCollective_getCohorteVaeCollectiveById(
      commanditaireVaeCollectiveId: $commanditaireVaeCollectiveId
      cohorteVaeCollectiveId: $cohorteVaeCollectiveId
    ) {
      id
      nom
    }
    organism_searchOrganisms(
      searchText: $searchText
      offset: $offset
      limit: $limit
    ) {
      info {
        totalRows
        totalPages
        currentPage
      }
      rows {
        id
        label
        isMaisonMereMCFCompatible
        modaliteAccompagnement
        conformeNormesAccessibilite
        adresseNumeroEtNomDeRue
        adresseInformationsComplementaires
        adresseVille
        adresseCodePostal
      }
    }
  }
`);

export const searchOrganismsAndGetCohorteInfo = async ({
  commanditaireVaeCollectiveId,
  cohorteVaeCollectiveId,
  searchText,
  offset,
  limit,
}: {
  commanditaireVaeCollectiveId: string;
  cohorteVaeCollectiveId: string;
  searchText?: string;
  offset?: number;
  limit?: number;
}) => {
  const accessToken = await getAccessTokenFromCookie();

  const result = throwUrqlErrors(
    await client.query(
      searchOrganismsAndGetCohorteInfoQuery,
      {
        commanditaireVaeCollectiveId,
        cohorteVaeCollectiveId,
        searchText,
        offset,
        limit,
      },
      {
        fetchOptions: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      },
    ),
  );

  if (!result.data?.organism_searchOrganisms) {
    throw new Error("Organismes non trouvées");
  }

  if (!result.data.vaeCollective_getCohorteVaeCollectiveById) {
    throw new Error("Cohorte non trouvée");
  }

  console.log(result.data.organism_searchOrganisms);
  return {
    cohorte: result.data.vaeCollective_getCohorteVaeCollectiveById,
    organisms: result.data.organism_searchOrganisms,
  };
};
