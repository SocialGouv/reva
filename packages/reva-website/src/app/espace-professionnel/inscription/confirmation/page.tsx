import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

import { MainLayout } from "@/app/_components/layout/main-layout/MainLayout";
import { OrganismBackground } from "@/components/layout/blue-layout/OrganismBackground";

const ProfessionalSpaceInscriptionConfirmationPage = () => {
  return (
    <MainLayout>
      <Head>
        <title>
          Confirmation de création de compte personnel - France VAE | Prenez
          votre avenir professionnel en main
        </title>
      </Head>
      <OrganismBackground>
        <div
          className="flex justify-between w-full items-center"
          data-testid="has-subscribed-successfully"
        >
          <div className="flex flex-col justify-center">
            <h1>Votre demande d'inscription est enregistrée</h1>
            <p className="text-xl">
              Pour finaliser votre inscription sur la plateforme France VAE,
              vous devez d'abord consulter et répondre à ce questionnaire de
              présentation et d'explication du rôle de l'Architecte
              Accompagnateur de Parcours.
            </p>
            <p className="text-xl">
              Ce questionnaire vous sera également envoyé par courriel.
            </p>
            <p className="text-sm text-neutral-500">
              Si votre dossier est valide et complet, vous recevrez un courriel
              de validation !
            </p>
            <div>
              <Link href="https://tally.so/r/n0M4Ry" target="_blank">
                Questionnaire de référencement
              </Link>
            </div>
          </div>
          <Image
            src="/professional-space/submitted-successfully.png"
            alt="Inscription réussie"
            width={282}
            height={319}
            className="hidden md:block max-h-[319px]"
          />
        </div>
      </OrganismBackground>
    </MainLayout>
  );
};

export default ProfessionalSpaceInscriptionConfirmationPage;
