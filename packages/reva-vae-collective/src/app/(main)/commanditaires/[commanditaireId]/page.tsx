import { client } from "@/helpers/graphql/urql-client/urqlClient";
import { gql } from "@urql/core";
import { cookies } from "next/headers";

export default async function CommanditairePage({
  params,
}: {
  params: Promise<{ commanditaireId: string }>;
}) {
  const loadCommanditaire = async (
    commanditaireVaeCollectiveId: string,
  ): Promise<{
    id: string;
    raisonSociale: string;
    cohorteVaeCollectives: { id: string; nom: string }[];
  }> => {
    const cookieStore = await cookies();
    const tokens = cookieStore.get("tokens");

    if (!tokens) {
      throw new Error("Session expirée, veuillez vous reconnecter");
    }

    const { accessToken } = JSON.parse(tokens.value);

    const result = await client.query(
      gql`
        query CommanditaireVaeCollective($commanditaireVaeCollectiveId: ID!) {
          vaeCollective_getCommanditaireVaeCollective(
            commanditaireVaeCollectiveId: $commanditaireVaeCollectiveId
          ) {
            id
            raisonSociale
            cohorteVaeCollectives {
              id
              nom
            }
          }
        }
      `,
      { commanditaireVaeCollectiveId },
      { fetchOptions: { headers: { Authorization: `Bearer ${accessToken}` } } },
    );

    return result.data?.vaeCollective_getCommanditaireVaeCollective;
  };

  const commanditaireId = (await params).commanditaireId;

  const commanditaire = await loadCommanditaire(commanditaireId);

  return (
    <div className="fr-container">
      <h1 className="mb-12">Bienvenue dans votre espace France VAE</h1>

      <h2>Vos cohortes:</h2>
      <ul>
        {commanditaire?.cohorteVaeCollectives.map((cohorte) => (
          <li key={cohorte.id}>{cohorte.nom}</li>
        ))}
      </ul>
    </div>
  );
}
