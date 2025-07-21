import { throwUrqlErrors } from "@/helpers/graphql/throw-urql-errors/throwUrqlErrors";
import { client } from "@/helpers/graphql/urql-client/urqlClient";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { gql } from "@urql/core";
import { redirect } from "next/navigation";
import { Card } from "@codegouvfr/react-dsfr/Card";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { format } from "date-fns";
import { getAccessTokenFromCookie } from "@/helpers/auth/get-access-token-from-cookie/getAccessTokenFromCookie";

const loadCommanditaire = async (
  commanditaireVaeCollectiveId: string,
): Promise<{
  id: string;
  raisonSociale: string;
  cohorteVaeCollectives: {
    rows: {
      id: string;
      nom: string;
      codeInscription: string;
      createdAt: number;
      certificationCohorteVaeCollectives: {
        id: string;
        certification: {
          id: string;
          label: string;
        };
        certificationCohorteVaeCollectiveOnOrganisms: {
          id: string;
          organism: {
            id: string;
            label: string;
          };
        }[];
      }[];
    }[];
  };
}> => {
  const accessToken = await getAccessTokenFromCookie();

  const result = throwUrqlErrors(
    await client.query(
      gql`
        query commanditaireVaeCollectiveForCohortesPage(
          $commanditaireVaeCollectiveId: ID!
        ) {
          vaeCollective_getCommanditaireVaeCollective(
            commanditaireVaeCollectiveId: $commanditaireVaeCollectiveId
          ) {
            id
            raisonSociale
            cohorteVaeCollectives {
              rows {
                id
                nom
                codeInscription
                createdAt
                certificationCohorteVaeCollectives {
                  id
                  certification {
                    id
                    label
                  }
                  certificationCohorteVaeCollectiveOnOrganisms {
                    id
                    organism {
                      id
                      label
                    }
                  }
                }
              }
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

  if (!commanditaire.cohorteVaeCollectives.rows.length) {
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
        {commanditaire?.cohorteVaeCollectives?.rows?.map((cohorte) => {
          const certification = cohorte.certificationCohorteVaeCollectives[0];
          const organism =
            certification?.certificationCohorteVaeCollectiveOnOrganisms?.[0];
          return (
            <li key={cohorte.id} data-testid="cohorte-list">
              <Card
                data-testid="cohorte-card"
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
                desc={
                  <>
                    {certification && (
                      <span className="text-sm" data-testid="certification">
                        {certification.certification.label}
                      </span>
                    )}
                    {organism && (
                      <>
                        <br />
                        <span className="text-sm" data-testid="organism">
                          {organism.organism.label}
                        </span>
                      </>
                    )}
                  </>
                }
                end={
                  <p className="text-xs text-dsfrGray-mentionGrey mb-0">
                    Créée le {format(cohorte.createdAt, "dd/MM/yyyy")}
                  </p>
                }
                linkProps={{
                  href: `/vae-collective/commanditaires/${commanditaireId}/cohortes/${cohorte.id}`,
                }}
              ></Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
