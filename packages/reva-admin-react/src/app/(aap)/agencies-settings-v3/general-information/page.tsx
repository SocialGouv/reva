"use client";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { useAuth } from "@/components/auth/auth";
import { useGeneralInformationPage } from "./generalInformationPage.hook";
import { LegalInformationUpdateBlock } from "./_components/legal-information-update-block/LegalInformationUpdateBlock";
import { CompanyBadges } from "@/components/company-preview";
import { GrayCard } from "@/components/card/gray-card/GrayCard";
import { ReactNode } from "react";
import { Button } from "@codegouvfr/react-dsfr/Button";

const GeneralInformationPage = () => {
  const { maisonMereAAP, generalInformationsStatus, etablissement } =
    useGeneralInformationPage();

  const { isGestionnaireMaisonMereAAP } = useAuth();
  return (
    <div className="flex flex-col w-full">
      <h1>Informations juridiques</h1>
      <p>
        Retrouvez ici les informations renseignées lors de l’inscription. Vous
        pouvez signaler un changement au support si ces informations ne sont
        plus à jour.
      </p>

      {generalInformationsStatus === "error" && (
        <Alert
          className="mb-6"
          severity="error"
          title="Une erreur est survenue pendant la récupération des informations générales."
        />
      )}
      {generalInformationsStatus == "success" && maisonMereAAP && (
        <ul className="list-none flex flex-col gap-6 pl-0">
          <GrayCard className="min-h-[220px]">
            <h2>Informations liées au SIRET - {maisonMereAAP.siret}</h2>
            {etablissement && (
              <>
                <CompanyBadges
                  className="col-span-3 mb-4"
                  siegeSocial={etablissement.siegeSocial}
                  dateFermeture={
                    etablissement.dateFermeture
                      ? new Date(etablissement.dateFermeture)
                      : null
                  }
                  qualiopiStatus={!!etablissement.qualiopiStatus}
                />
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <Info title="Raison sociale">
                    {etablissement.raisonSociale}
                  </Info>
                  <Info title="Forme juridique">
                    {etablissement.formeJuridique.libelle}
                  </Info>
                </div>
              </>
            )}
          </GrayCard>
          <GrayCard>
            <h2>Informations saisies à l’inscription</h2>
            <div className="grid grid-cols-1 md:grid-cols-2">
              <Info title="Dirigeant(e)">
                {maisonMereAAP.managerFirstname} {maisonMereAAP.managerLastname}
              </Info>
              <Info title="Administrateur">
                {maisonMereAAP.gestionnaire.firstname}{" "}
                {maisonMereAAP.gestionnaire.lastname}
              </Info>
              <Info title="Email">{maisonMereAAP.gestionnaire.email}</Info>
              <Info title="Téléphone">{maisonMereAAP.phone}</Info>
            </div>
          </GrayCard>
          {isGestionnaireMaisonMereAAP && (
            <li>
              <LegalInformationUpdateBlock
                maisonMereAAPId={maisonMereAAP.id}
                statutValidationInformationsJuridiquesMaisonMereAAP={
                  maisonMereAAP.statutValidationInformationsJuridiquesMaisonMereAAP
                }
                decisions={maisonMereAAP.legalInformationDocumentsDecisions.map(
                  (d) => ({
                    ...d,
                    decisionTakenAt: new Date(d.decisionTakenAt),
                  }),
                )}
              />
            </li>
          )}
        </ul>
      )}
      <Button
        className="mt-12"
        priority="tertiary"
        linkProps={{ href: "/agencies-settings-v3" }}
      >
        Retour
      </Button>
    </div>
  );
};

export default GeneralInformationPage;

const Info = ({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) => (
  <dl className={`m-2 ${className || ""}`}>
    <dt className="mb-1">{title}</dt>
    <dd className="font-medium">{children}</dd>
  </dl>
);
