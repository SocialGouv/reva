import { OrganismBackground } from "@/components/layout/blue-layout/OrganismBackground";
import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import { PICTOGRAMS } from "@/components/pictograms";
import { Hexagon } from "@/components/section-content/SectionContent";
import Head from "next/head";
import * as React from "react";

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
        <div className="flex flex-col md:flex-row gap-10">
          <div className="flex flex-col items-start">
            <h1 className="max-w-2xl">
              Votre demande d'inscription est enregistrée.
            </h1>
            <div role="status" className="flex flex-col">
              <p className="text-xl">
                Elle sera étudiée par un administrateur France VAE dans les plus
                brefs délais.
              </p>
              <p className="text-sm">
                Vous pourrez paramétrer votre compte après validation de votre
                demande d’inscription.
              </p>
            </div>
          </div>
          <div className="m-auto flex items-center justify-center relative">
            <Hexagon className="text-gray-100 w-[150px]" />
            <div className="absolute mx-auto">
              {PICTOGRAMS.technicalErrorLG}
            </div>
          </div>
        </div>
      </OrganismBackground>
    </MainLayout>
  );
};

export default ProfessionalSpaceInscriptionConfirmationPage;
