"use client";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Input from "@codegouvfr/react-dsfr/Input";
import { useLegalInformationsPage } from "./legalInformationsPage.hook";
import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";
import { useAuth } from "@/components/auth/auth";
import { LegalInformationUpdateBlock } from "@/app/(aap)/agencies-settings/legal-information/_components/legal-information-update-block/LegalInformationUpdateBlock";
import { GrayCard } from "@/components/card/gray-card/GrayCard";

const LegalInformationPage = () => {
  const { maisonMereAAP, legalInformationsStatus } = useLegalInformationsPage();
  const { isGestionnaireMaisonMereAAP } = useAuth();
  const { isFeatureActive } = useFeatureflipping();
  return (
    <div className="flex flex-col w-full">
      <h1>Informations juridiques</h1>

      {legalInformationsStatus === "error" && (
        <Alert
          className="mb-6"
          severity="error"
          title="Une erreur est survenue pendant la récupération des informations juridiques."
        />
      )}
      {legalInformationsStatus == "success" && (
        <>
          {maisonMereAAP && (
            <>
              <fieldset className="flex flex-col gap-4 mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="SIRET de l'établissement"
                    nativeInputProps={{
                      value: maisonMereAAP.siret,
                    }}
                    disabled
                  />

                  <Input
                    label="Forme juridique"
                    nativeInputProps={{
                      value: maisonMereAAP.statutJuridique,
                    }}
                    disabled
                  />

                  <Input
                    label="Raison sociale"
                    nativeInputProps={{
                      value: maisonMereAAP.raisonSociale,
                    }}
                    disabled
                  />

                  <Input
                    label="Site internet de l'établissement"
                    nativeInputProps={{
                      value: maisonMereAAP.siteWeb ?? "",
                    }}
                    disabled
                  />
                </div>
              </fieldset>
              <GrayCard className="mb-8">
                <h2 className="font-bold text-xxl">
                  Administrateur du compte FranceVAE
                </h2>
                <div className="grid grid-cols-2">
                  <p>
                    <span className="font-bold">Prénom : </span>
                    <br />
                    {maisonMereAAP.gestionnaire.firstname}
                  </p>
                  <p>
                    <span className="font-bold">Nom : </span>
                    <br />
                    {maisonMereAAP.gestionnaire.lastname}
                  </p>
                </div>
              </GrayCard>
            </>
          )}
          {isFeatureActive("LEGAL_INFORMATION_VALIDATION") &&
            isGestionnaireMaisonMereAAP &&
            maisonMereAAP && (
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
            )}
        </>
      )}
    </div>
  );
};

export default LegalInformationPage;
