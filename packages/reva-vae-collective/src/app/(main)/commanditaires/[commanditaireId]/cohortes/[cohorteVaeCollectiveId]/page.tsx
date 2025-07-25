import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Link from "next/link";

import { getAccessTokenFromCookie } from "@/helpers/auth/get-access-token-from-cookie/getAccessTokenFromCookie";
import { client } from "@/helpers/graphql/urql-client/urqlClient";

import { CertificationCard } from "./_components/certification-card/CertificationCard";
import { DeleteCohorteButton } from "./_components/delete-cohorte-button/DeleteCohorteButton";

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
        status
        certificationCohorteVaeCollectives {
          id
          certification {
            id
            label
            codeRncp
          }
        }
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
    <div className="flex flex-col w-full">
      <Breadcrumb
        className="mt-0 mb-4"
        currentPageLabel={cohorte.nom}
        segments={[
          {
            label: "Cohortes",
            linkProps: {
              href: `/commanditaires/${commanditaireId}/cohortes`,
            },
          },
        ]}
      />
      <div className="flex justify-between items-center">
        <h1>{cohorte.nom}</h1>
        <Link
          className="text-sm bg-none p-2 fr-link fr-icon-edit-line fr-link--icon-left mb-6"
          href={`/commanditaires/${commanditaireId}/cohortes/${cohorteVaeCollectiveId}/modifier-intitule`}
        >
          Modifier l’intitulé
        </Link>
      </div>
      <p className="mb-12">
        Paramétrez votre cohorte, afin de générer un lien unique à transmettre
        aux candidats devant intégrer cette cohorte.
      </p>

      <CertificationCard
        commanditaireId={commanditaireId}
        cohorteVaeCollectiveId={cohorteVaeCollectiveId}
        certification={
          cohorte.certificationCohorteVaeCollectives?.[0]?.certification
        }
        disabled={cohorte.status !== "BROUILLON"}
      />

      <hr className="mt-8 mb-2" />

      <DeleteCohorteButton
        commanditaireId={commanditaireId}
        cohorteVaeCollectiveId={cohorteVaeCollectiveId}
        nomCohorte={cohorte.nom}
        disabled={cohorte.status !== "BROUILLON"}
      />

      <Button
        className="mt-12"
        priority="secondary"
        linkProps={{
          href: `/commanditaires/${commanditaireId}/cohortes`,
        }}
      >
        Retour
      </Button>
    </div>
  );
}
