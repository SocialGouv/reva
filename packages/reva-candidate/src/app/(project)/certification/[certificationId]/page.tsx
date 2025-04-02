import { PageLayout } from "@/layouts/page.layout";

import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { CertificationPage } from "@/components/certification-page/CertificationPage";
import { graphql } from "@/graphql/generated";
import { getSsrGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import CertificationChangeButtons from "./_components/CertificationChangeButtons";

const GET_CERTIFICATION = graphql(`
  query getCertificationById($certificationId: ID!) {
    getCertification(certificationId: $certificationId) {
      id
      prerequisites {
        id
        label
      }
      certificationAuthorityStructure {
        label
      }
      juryPlace
      juryEstimatedCost
      juryTypeSoutenanceOrale
      juryTypeMiseEnSituationProfessionnelle
      rncpObjectifsContexte
      level
      typeDiplome
      id
      label
      codeRncp
      isAapAvailable
    }
  }
`);

export default async function CertificationDetail({
  params,
}: {
  params: Promise<{ certificationId: string }>;
}) {
  const { graphqlClient } = getSsrGraphQlClient();
  const { certificationId } = await params;

  const data = await graphqlClient.request(GET_CERTIFICATION, {
    certificationId,
  });
  const certification = data?.getCertification;

  if (!certification) {
    return null;
  }

  return (
    <PageLayout title="Choix du diplôme" data-test={`certificates`}>
      <Breadcrumb
        currentPageLabel="Diplôme visé"
        className="mb-4"
        homeLinkProps={{
          href: "/candidat",
        }}
        segments={[]}
      />
      <CertificationPage certification={certification} />
      <CertificationChangeButtons selectedCertification={certification} />
    </PageLayout>
  );
}
