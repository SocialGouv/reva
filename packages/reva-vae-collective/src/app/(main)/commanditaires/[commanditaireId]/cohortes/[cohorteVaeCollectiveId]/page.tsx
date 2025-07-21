import { getAccessTokenFromCookie } from "@/helpers/auth/get-access-token-from-cookie/getAccessTokenFromCookie";
import { client } from "@/helpers/graphql/urql-client/urqlClient";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Button } from "@codegouvfr/react-dsfr/Button";

const getCohorteById = async (
  commanditaireVaeCollectiveId: string,
  cohorteVaeCollectiveId: string,
) => {
  const accessToken = await getAccessTokenFromCookie();

  const result = await client.query(
    `
    query getCohorteByIdForCohortePage($commanditaireVaeCollectiveId: ID!, $cohorteVaeCollectiveId: ID!) {
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
  params: Promise<{ commanditaireId: string; cohorteVaeCollectiveId: string }>;
}) {
  const { commanditaireId, cohorteVaeCollectiveId } = await params;

  const cohorte = await getCohorteById(commanditaireId, cohorteVaeCollectiveId);

  return (
    <div>
      <Breadcrumb
        className="mt-0 mb-4"
        currentPageLabel={cohorte.nom}
        segments={[
          {
            label: "Cohortes",
            linkProps: {
              href: `/vae-collective/commanditaires/${commanditaireId}/cohortes`,
            },
          },
        ]}
      />
      <h1>{cohorte.nom}</h1>
      <p>
        Paramétrez votre cohorte, afin de générer un lien unique à transmettre
        aux candidats devant intégrer cette cohorte.
      </p>
      <Button
        className="mt-12"
        priority="secondary"
        linkProps={{
          href: `/vae-collective/commanditaires/${commanditaireId}/cohortes`,
        }}
      >
        Retour
      </Button>
    </div>
  );
}
