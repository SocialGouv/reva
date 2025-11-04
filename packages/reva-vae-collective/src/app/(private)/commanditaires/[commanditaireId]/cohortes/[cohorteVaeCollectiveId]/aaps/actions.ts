"use server";

import { redirect } from "next/navigation";

import { getAccessTokenFromCookie } from "@/helpers/auth/get-access-token-from-cookie/getAccessTokenFromCookie";
import { throwUrqlErrors } from "@/helpers/graphql/throw-urql-errors/throwUrqlErrors";
import { client } from "@/helpers/graphql/urql-client/urqlClient";

import { graphql } from "@/graphql/generated";

const getCohorteByIdQuery = graphql(`
  query getCohorteByIdForSearchAAPPage(
    $commanditaireVaeCollectiveId: ID!
    $cohorteVaeCollectiveId: ID!
  ) {
    vaeCollective_getCohorteVaeCollectiveById(
      commanditaireVaeCollectiveId: $commanditaireVaeCollectiveId
      cohorteVaeCollectiveId: $cohorteVaeCollectiveId
    ) {
      id
      nom
      certificationCohorteVaeCollectives {
        certification {
          id
        }
      }
    }
  }
`);

const searchOrganismQuery = graphql(`
  query searchOrganismsForSearchAAPPage(
    $certificationId: ID!
    $searchText: String
    $offset: Int
    $limit: Int
  ) {
    organism_searchOrganisms(
      certificationId: $certificationId
      searchText: $searchText
      offset: $offset
      limit: $limit
      disponiblePourVaeCollective: true
    ) {
      info {
        totalRows
        totalPages
        currentPage
      }
      rows {
        id
        label
        nomPublic
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

  const getCohorteByIdResult = throwUrqlErrors(
    await client.query(
      getCohorteByIdQuery,
      {
        commanditaireVaeCollectiveId,
        cohorteVaeCollectiveId,
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

  if (!getCohorteByIdResult?.data?.vaeCollective_getCohorteVaeCollectiveById) {
    throw new Error("Cohorte non trouvée");
  }

  const certificationId =
    getCohorteByIdResult.data?.vaeCollective_getCohorteVaeCollectiveById
      ?.certificationCohorteVaeCollectives[0]?.certification?.id;

  if (!certificationId) {
    throw new Error("Certification non trouvée");
  }

  const searchOrganismsResult = throwUrqlErrors(
    await client.query(
      searchOrganismQuery,
      {
        certificationId,
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

  if (!searchOrganismsResult.data?.organism_searchOrganisms) {
    throw new Error("Organismes non trouvées");
  }

  return {
    cohorte:
      getCohorteByIdResult.data.vaeCollective_getCohorteVaeCollectiveById,
    organisms: searchOrganismsResult.data.organism_searchOrganisms,
  };
};

const updateCohorteVAECollectiveOrganismQuery = graphql(`
  mutation updateCohorteVAECollectiveOrganism(
    $commanditaireVaeCollectiveId: ID!
    $cohorteVaeCollectiveId: ID!
    $organismId: ID!
  ) {
    vaeCollective_updateCohorteVAECollectiveOrganism(
      commanditaireVaeCollectiveId: $commanditaireVaeCollectiveId
      cohorteVaeCollectiveId: $cohorteVaeCollectiveId
      organismId: $organismId
    ) {
      id
    }
  }
`);

export async function updateCohorteVAECollectiveOrganism({
  commanditaireVaeCollectiveId,
  cohorteVaeCollectiveId,
  organismId,
}: {
  commanditaireVaeCollectiveId: string;
  cohorteVaeCollectiveId: string;
  organismId: string;
}) {
  const accessToken = await getAccessTokenFromCookie();

  throwUrqlErrors(
    await client.mutation(
      updateCohorteVAECollectiveOrganismQuery,
      {
        commanditaireVaeCollectiveId,
        cohorteVaeCollectiveId,
        organismId,
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

  redirect(
    `/commanditaires/${commanditaireVaeCollectiveId}/cohortes/${cohorteVaeCollectiveId}`,
  );
}
