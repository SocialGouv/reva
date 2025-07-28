import { getAccessTokenFromCookie } from "@/helpers/auth/get-access-token-from-cookie/getAccessTokenFromCookie";
import { throwUrqlErrors } from "@/helpers/graphql/throw-urql-errors/throwUrqlErrors";
import { client } from "@/helpers/graphql/urql-client/urqlClient";

import { graphql } from "@/graphql/generated";

import { CertificationPageContent } from "./_components/certification-page-content/CertificationPageContent";

const getCertificationAndCohorteInfoQuery = graphql(`
  query getCertificationAndCohorteInfoForCertificationPage(
    $commanditaireVaeCollectiveId: ID!
    $cohorteVaeCollectiveId: ID!
    $certificationId: ID!
  ) {
    vaeCollective_getCohorteVaeCollectiveById(
      commanditaireVaeCollectiveId: $commanditaireVaeCollectiveId
      cohorteVaeCollectiveId: $cohorteVaeCollectiveId
    ) {
      id
      nom
    }
    getCertification(certificationId: $certificationId) {
      id
      codeRncp
      label
      isAapAvailable
      level
      typeDiplome
      rncpObjectifsContexte
      prerequisites {
        id
        label
      }
      juryTypeMiseEnSituationProfessionnelle
      juryTypeSoutenanceOrale
      juryEstimatedCost
      juryPlace
      certificationAuthorityStructure {
        label
      }
    }
  }
`);

const getCertificationAndCohorteInfo = async ({
  commanditaireVaeCollectiveId,
  cohorteVaeCollectiveId,
  certificationId,
}: {
  commanditaireVaeCollectiveId: string;
  cohorteVaeCollectiveId: string;
  certificationId: string;
}) => {
  const accessToken = await getAccessTokenFromCookie();

  const result = throwUrqlErrors(
    await client.query(
      getCertificationAndCohorteInfoQuery,
      {
        commanditaireVaeCollectiveId,
        cohorteVaeCollectiveId,
        certificationId,
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

  if (!result.data?.getCertification) {
    throw new Error("Certification non trouvée");
  }

  if (!result.data?.vaeCollective_getCohorteVaeCollectiveById) {
    throw new Error("Cohorte non trouvée");
  }

  return {
    cohorteVaeCollective: result.data.vaeCollective_getCohorteVaeCollectiveById,
    certification: result.data.getCertification,
  };
};

export default async function CertificationPage({
  params,
}: {
  params: Promise<{
    commanditaireId: string;
    cohorteVaeCollectiveId: string;
    certificationId: string;
  }>;
}) {
  const { commanditaireId, cohorteVaeCollectiveId, certificationId } =
    await params;

  const { cohorteVaeCollective, certification } =
    await getCertificationAndCohorteInfo({
      commanditaireVaeCollectiveId: commanditaireId,
      cohorteVaeCollectiveId,
      certificationId,
    });

  return (
    <CertificationPageContent
      commanditaireId={commanditaireId}
      cohorteVaeCollective={cohorteVaeCollective}
      certification={certification}
    />
  );
}
