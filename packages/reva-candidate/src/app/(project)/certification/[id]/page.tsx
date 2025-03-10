import { PageLayout } from "@/layouts/page.layout";
import { Button } from "@codegouvfr/react-dsfr/Button";

import Link from "next/link";
import CallOut from "@codegouvfr/react-dsfr/CallOut";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { getSsrGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";

const getCertificationQuery = graphql(`
  query getCertificationForCertificationPage($certificationId: ID!) {
    getCertification(certificationId: $certificationId) {
      id
      codeRncp
      label
      isAapAvailable
    }
  }
`);

export default async function CertificationDetail({
  params,
}: {
  params: { id: string };
}) {
  const selectedCertificationId = params.id;
  const { graphqlClient } = getSsrGraphQlClient();

  const { getCertification } = await graphqlClient.request(
    getCertificationQuery,
    {
      certificationId: selectedCertificationId,
    },
  );
  const selectedCertification = getCertification;
  if (!selectedCertification) {
    return null;
  }
  return (
    <PageLayout title="Choix du diplôme" data-test={`certificates`}>
      <Breadcrumb
        currentPageLabel="Diplôme visé"
        className="mb-0"
        homeLinkProps={{
          href: "/",
        }}
        segments={[]}
      />
      <h2
        data-test="certification-label"
        className="mt-6 mb-2 text-2xl font-bold text-black "
      >
        {selectedCertification.label}
      </h2>
      <p data-test="certification-code-rncp" className="text-xs mb-4">
        Code RNCP: {selectedCertification.codeRncp}
      </p>
      <div className="mb-12 h-5 px-1.5 bg-[#e8edff] rounded justify-center items-center leading-tight inline-flex text-[#0063cb] text-xs font-bold uppercase ">
        VAE EN AUTONOMIE ou accompagnée
      </div>
      <p>
        <a
          data-test="certification-more-info-link"
          target="_blank"
          rel="noreferrer"
          href={`https://www.francecompetences.fr/recherche/rncp/${selectedCertification.codeRncp}/`}
          className="text-dsfrBlue-500"
        >
          Lire les détails de la fiche diplôme
        </a>
      </p>

      <CallOut
        title="À quoi sert un accompagnateur ?"
        classes={{ title: "pb-2" }}
        className="w-full md:w-3/5 mt-8 mb-12"
      >
        C’est un expert de la VAE qui vous aide à chaque grande étape de votre
        parcours : rédaction du dossier de faisabilité, communication avec le
        certificateur, préparation au passage devant le jury, etc.
        <br />
        <br />
        <strong>Bon à savoir :</strong> ces accompagnements peuvent être en
        partie financés par votre{" "}
        <Link
          href="https://www.moncompteformation.gouv.fr/espace-public/consulter-mes-droits-formation"
          target="_blank"
        >
          Compte Personnel de Formation
        </Link>
        . Nous attirons votre attention sur le fait que les frais liés à votre
        passage devant le jury et les actions de formations complémentaires sont
        entièrement à votre charge.
      </CallOut>

      <div className="flex flex-col-reverse md:flex-row gap-4 justify-between mt-6">
        <Button
          priority="secondary"
          className="justify-center w-[100%]  md:w-fit"
          linkProps={{ href: "/candidat" }}
        >
          Retour
        </Button>
        <Button
          data-test="change-certification-button"
          priority="tertiary no outline"
          className="justify-center w-[100%]  md:w-fit"
          linkProps={{ href: "/candidat/search-certification" }}
        >
          Changer de diplôme
        </Button>
      </div>
    </PageLayout>
  );
}
