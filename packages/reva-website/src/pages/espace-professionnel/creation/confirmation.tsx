import * as React from "react";
import { BlueLayout } from "@/components/layout/blue-layout/BlueLayout";
import Image from "next/image";
import Head from "next/head";
import unionSvg from "./assets/union.svg";

const ProfessionalSpaceCreationConfirmationPage = () => {
  return (
    <>
      <Head>
        <title>
          Confirmation de création de compte personnel - Reva | Prenez votre
          avenir professionnel en main
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
            src={unionSvg}
            className="self-center mb-14"
            alt=""
            width={80}
            height={60}
          />
          <p className="text-xl">
            Félicitations, votre demande de création de compte a bien été
            enregistrée ! Vous recevrez un email contenant un lien d'activation
            du compte valable 4 jours, dès qu’un administrateur France VAE
            l’aura traitée. En cas de question vous pouvez contacter :
            support@reva.beta.gouv.fr
          </p>
        </div>
      </BlueLayout>
    </>
  );
};

export default ProfessionalSpaceCreationConfirmationPage;
