import { getAccessTokenFromCookie } from "@/helpers/auth/get-access-token-from-cookie/getAccessTokenFromCookie";
import { client } from "@/helpers/graphql/urql-client/urqlClient";

const getCohorteById = async (
  commanditaireVaeCollectiveId: string,
  cohorteVaeCollectiveId: string,
) => {
  const accessToken = await getAccessTokenFromCookie();

  const result = await client.query(
    `
    query getCohorteById($commanditaireVaeCollectiveId: ID!, $cohorteVaeCollectiveId: ID!) {
      vaeCollective_getCohorteVaeCollectiveById(commanditaireVaeCollectiveId: $commanditaireVaeCollectiveId, cohorteVaeCollectiveId: $cohorteVaeCollectiveId) {
        id
        nom
      }
    }
    `,
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
  );

  return result.data.vaeCollective_getCohorteVaeCollectiveById;
};

export default async function CohortePage({
  params,
}: {
  params: { commanditaireId: string; cohorteVaeCollectiveId: string };
}) {
  const { commanditaireId, cohorteVaeCollectiveId } = await params;

  const cohorte = await getCohorteById(commanditaireId, cohorteVaeCollectiveId);

  return (
    <div>
      <h1>{cohorte.nom}</h1>
    </div>
  );
}
