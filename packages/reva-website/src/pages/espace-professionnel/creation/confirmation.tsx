import { OrganismBackground } from "@/components/layout/blue-layout/OrganismBackground";
import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import Head from "next/head";
import Image from "next/image";
import * as React from "react";

const ProfessionalSpaceCreationConfirmationPage = () => {
  return (
    <MainLayout>
      <Head>
        <title>
          Confirmation de création de compte personnel - France VAE | Prenez
          votre avenir professionnel en main
        </title>
      </Head>
      <OrganismBackground>
        <h1 className="text-center max-w-2xl mx-auto">
          Votre demande de création de compte a bien été enregistrée.
        </h1>
        <div role="status" className="flex flex-col text-center items-center">
          <Image
            src="/professional-space/creation/union.svg"
            className="self-center mb-14"
            alt=""
            width={80}
            height={60}
          />
          <p className="text-xl">
            L’équipe France VAE va maintenant analyser votre inscription. Cela
            peut prendre quelques jours.
          </p>
          <p className="text-xl max-w-3xl">
            Une fois votre demande validée par nos conseillers, vous recevrez un
            e-mail contenant un lien d'activation qui sera valable pendant 4
            jours.
          </p>
          <p className="text-xl">
            En cas de question, vous pouvez contacter :{" "}
            <a href="mailto:support@vae.gouv.fr">support@vae.gouv.fr</a>
          </p>

          <Alert
            severity="info"
            title={
              <div className="flex flex-col items-start gap-2 font-normal">
                <p>
                  Afin de vous assurer que vous recevez bien nos e-mails,{" "}
                  <strong>
                    pensez à vérifier votre dossier de courrier indésirable ou
                    votre outil de filtrage de spams
                  </strong>{" "}
                  si votre structure en utilise un (ex : Mail in Black).
                </p>
              </div>
            }
          />

          <Button
            priority="primary"
            className="self-center !w-full  lg:!w-fit mt-8"
            linkProps={{ href: "/espace-professionnel" }}
            size="large"
          >
            C'est compris !
          </Button>
        </div>
      </OrganismBackground>
    </MainLayout>
  );
};

export default ProfessionalSpaceCreationConfirmationPage;
