import { getAccessTokenFromCookie } from "@/helpers/auth/get-access-token-from-cookie/getAccessTokenFromCookie";
import { throwUrqlErrors } from "@/helpers/graphql/throw-urql-errors/throwUrqlErrors";
import { client } from "@/helpers/graphql/urql-client/urqlClient";

import { graphql } from "@/graphql/generated";

import { CertificationPageContent } from "./_components/certification-page-content/CertificationPageContent";

const getCertificationInfoQuery = graphql(`
  query getCertificationInfoForCertificationPage($certificationId: ID!) {
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
    }
  }
`);

const getCertificationInfo = async ({
  certificationId,
}: {
  certificationId: string;
}) => {
  const accessToken = await getAccessTokenFromCookie();

  const result = throwUrqlErrors(
    await client.query(
      getCertificationInfoQuery,
      {
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

  return result.data.getCertification;
};

export default async function CertificationPage({
  params,
  searchParams,
}: {
  params: Promise<{
    commanditaireId: string;
    cohorteVaeCollectiveId: string;
    certificationId: string;
  }>;
  searchParams: Promise<{ certificationSelectionDisabled?: string }>;
}) {
  const { commanditaireId, cohorteVaeCollectiveId, certificationId } =
    await params;

  const {
    certificationSelectionDisabled: certificationSelectionDisabledAsString,
  } = await searchParams;

  const certificationSelectionDisabled =
    certificationSelectionDisabledAsString === "true";

  const certification = await getCertificationInfo({
    certificationId,
  });

  return (
    <CertificationPageContent
      commanditaireId={commanditaireId}
      cohorteVaeCollectiveId={cohorteVaeCollectiveId}
      certification={certification}
      certificationSelectionDisabled={certificationSelectionDisabled}
    />
  );
}
