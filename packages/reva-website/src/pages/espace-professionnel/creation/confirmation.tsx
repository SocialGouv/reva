import * as React from "react";
import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import { BlueLayout } from "@/components/layout/blue-layout/BlueLayout";
import Image from "next/image";
import Head from "next/head";

const ProfessionalSpaceCreationConfirmationPage = () => {
  return (
    <MainLayout>
      <Head>
        <title>
          Confirmation de création de compte personnel - Reva | Prenez votre
          avenir professionnel en main
        </title>
      </Head>
      <BlueLayout
        title="Créez votre compte professionnel"
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
            Votre compte vient d’être créé avec succès. Vous allez recevoir un
            lien sur votre adresse email pour confirmer votre inscription
          </p>
        </div>
      </BlueLayout>
    </MainLayout>
  );
};

export default ProfessionalSpaceCreationConfirmationPage;
