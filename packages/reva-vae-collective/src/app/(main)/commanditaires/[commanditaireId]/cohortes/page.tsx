import { throwUrqlErrors } from "@/helpers/graphql/throw-urql-errors/throwUrqlErrors";
import { client } from "@/helpers/graphql/urql-client/urqlClient";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { gql } from "@urql/core";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Card } from "@codegouvfr/react-dsfr/Card";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { format } from "date-fns";

const loadCommanditaire = async (
  commanditaireVaeCollectiveId: string,
): Promise<{
  id: string;
  raisonSociale: string;
  cohorteVaeCollectives: {
    id: string;
    nom: string;
    codeInscription: string;
    createdAt: number;
  }[];
}> => {
  const cookieStore = await cookies();
  const tokens = cookieStore.get("tokens");

  if (!tokens) {
    throw new Error("Session expirée, veuillez vous reconnecter");
  }

  const { accessToken } = JSON.parse(tokens.value);

  const result = throwUrqlErrors(
    await client.query(
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
              codeInscription
              createdAt
            }
          }
        }
      `,
      { commanditaireVaeCollectiveId },
      {
        fetchOptions: { headers: { Authorization: `Bearer ${accessToken}` } },
      },
    ),
  );

  return result.data?.vaeCollective_getCommanditaireVaeCollective;
};

export default async function CohortesPage({
  params,
}: {
  params: Promise<{ commanditaireId: string }>;
}) {
  const commanditaireId = (await params).commanditaireId;

  const commanditaire = await loadCommanditaire(commanditaireId);

  if (!commanditaire.cohorteVaeCollectives.length) {
    redirect(`/commanditaires/${commanditaireId}/cohortes/aucune-cohorte/`);
  }

  return (
    <div className="fr-container flex flex-col">
      <h1 className="mb-12">Cohortes</h1>
      <Button
        className="ml-auto mb-4"
        priority="secondary"
        linkProps={{
          href: `/vae-collective/commanditaires/${commanditaireId}/cohortes/nouvelle-cohorte/`,
        }}
      >
        Créer une cohorte
      </Button>
      <ul className="flex flex-col gap-4 list-none px-0 my-0">
        {commanditaire?.cohorteVaeCollectives.map((cohorte) => (
          <li key={cohorte.id}>
            <Card
              enlargeLink
              size="small"
              title={cohorte.nom}
              start={
                !cohorte.codeInscription && (
                  <Badge severity="warning" small className="mb-3">
                    En cours de paramètrage
                  </Badge>
                )
              }
              end={
                <p className="text-xs text-dsfrGray-mentionGrey mb-0">
                  Créée le {format(cohorte.createdAt, "dd/MM/yyyy")}
                </p>
              }
              linkProps={{
                href: `/vae-collective/commanditaires/${commanditaireId}/cohortes/${cohorte.id}`,
              }}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
