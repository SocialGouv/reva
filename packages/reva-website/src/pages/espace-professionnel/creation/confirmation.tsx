import { BlueLayout } from "@/components/layout/blue-layout/BlueLayout";
import { MainLayout } from "@/components/layout/main-layout/MainLayout";
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
      <BlueLayout
        title="Créez le compte administrateur de votre établissement (direction nationale ou régionale)"
        description="Félicitations, vous venez de créer votre compte"
      >
        <div
          role="status"
          className="flex flex-col max-w-[50em] xl:max-w-[63.5em]"
        >
          <Image
            src="/professional-space/creation/union.svg"
            className="self-center mb-14"
            alt=""
            width={80}
            height={60}
          />
          <p className="text-xl">
            Félicitations, votre demande de création de compte a bien été
            enregistrée ! Vous recevrez un email contenant un lien d'activation
            du compte valable 4 jours, dès qu’un administrateur Reva l’aura
            traitée. En cas de question vous pouvez contacter :
            support@reva.beta.gouv.fr
          </p>
        </div>
      </BlueLayout>
    </MainLayout>
  );
};

export default ProfessionalSpaceCreationConfirmationPage;
