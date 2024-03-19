"use client";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Input from "@codegouvfr/react-dsfr/Input";
import { useLegalInformationsPageQueries } from "./legalInformationsPageQueries";

const LegalInformationPage = () => {
  const {
    legalInformationsIsError,
    legalInformationsIsSuccess,
    maisonMereAAP,
    informationsCommerciales,
  } = useLegalInformationsPageQueries();

  return (
    <div className="flex flex-col w-full">
      <h1>Informations juridiques</h1>

      {legalInformationsIsError && (
        <Alert
          className="mb-6"
          severity="error"
          title="Une erreur est survenue pendant la récupération des informations juridiques."
        />
      )}
      {legalInformationsIsSuccess && (
        <>
          {maisonMereAAP && (
            <fieldset className="flex flex-col gap-4 mb-8">
              <h3 className="leading-6 font-bold">
                Informations juridiques de l'établissement
              </h3>
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
          )}

          {informationsCommerciales && (
            <fieldset className="flex flex-col gap-4">
              <h3 className="leading-6 font-bold">
                Adresse de l'établissement
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Numéro et nom de rue"
                  nativeInputProps={{
                    value:
                      informationsCommerciales.adresseNumeroEtNomDeRue ?? "",
                  }}
                  disabled
                />
                <Input
                  label="Code postal"
                  nativeInputProps={{
                    value: informationsCommerciales.adresseCodePostal ?? "",
                  }}
                  disabled
                />
                <Input
                  label="Ville"
                  nativeInputProps={{
                    value: informationsCommerciales.adresseVille ?? "",
                  }}
                  disabled
                />
                <Input
                  label="Informations complémentaires"
                  nativeInputProps={{
                    value:
                      informationsCommerciales.adresseInformationsComplementaires ??
                      "",
                  }}
                  disabled
                />
              </div>
            </fieldset>
          )}
        </>
      )}
    </div>
  );
};

export default LegalInformationPage;
