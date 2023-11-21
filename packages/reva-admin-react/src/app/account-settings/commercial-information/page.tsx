"use client";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { ConformiteNormeAccessibilite } from "@/graphql/generated/graphql";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import { useQuery } from "@tanstack/react-query";
import { ReactNode } from "react";

const informationsCommercialesQuery = graphql(`
  query getAccountOrganismAndInformationsCommerciales {
    account_getAccountForConnectedUser {
      organism {
        informationsCommerciales {
          nom
          telephone
          siteInternet
          emailContact
          adresseNumeroEtNomDeRue
          adresseInformationsComplementaires
          adresseCodePostal
          adresseVille
          conformeNormesAccessbilite
        }
      }
    }
  }
`);

const SmallNotice = ({ children }: { children: ReactNode }) => (
  <div className="text-blue-light-text-default-info flex items-start ">
    <span className="fr-icon--sm fr-icon-info-fill mr-2 -mt-[1px]" />
    <p className="text-sm">{children}</p>
  </div>
);

const CommercialInformationPage = () => {
  const { graphqlClient } = useGraphQlClient();
  const {
    data: informationsCommercialesResponse,
    status: informationsCommercialesStatus,
  } = useQuery({
    queryKey: ["candidacies"],
    queryFn: () => graphqlClient.request(informationsCommercialesQuery),
  });

  const informationsCommerciales =
    informationsCommercialesResponse?.account_getAccountForConnectedUser
      ?.organism?.informationsCommerciales;

  return informationsCommercialesStatus === "success" ? (
    <div className="flex flex-col">
      <h1 className="leading-6 font-bold text-2xl mb-8">
        Informations commerciales
      </h1>

      <Alert
        severity="info"
        title=""
        description="Les informations suivantes seront affichées aux candidats dans les résultats de recherche d’un AAP et dans le message récapitulant leur candidature. Si elles ne sont pas renseignées, les informations juridiques et administrateur seront prises par défaut."
      />

      <form
        data-testid="candidate-registration-form"
        className="flex flex-col mt-10"
      >
        <fieldset className="flex flex-col gap-4">
          <div>
            <Input
              className="!mb-4"
              label="Nom commercial (optionnel)"
              nativeInputProps={{
                defaultValue: informationsCommerciales?.nom || "",
              }}
            />
            <SmallNotice>
              Si vous ne renseignez pas ce champ, votre raison commerciale sera
              affichée par défaut.
            </SmallNotice>
          </div>
          <div>
            <Input
              className="!mb-4"
              label="Téléphone (optionnel)"
              nativeInputProps={{
                defaultValue: informationsCommerciales?.telephone || "",
              }}
            />
            <SmallNotice>
              Ce numéro de téléphone sera également envoyé aux candidats dans le
              message récapitulant leur inscription.
            </SmallNotice>
          </div>
          <div>
            <Input
              className="!mb-4"
              label="Site internet de l'établissement (optionnel)"
              nativeInputProps={{
                defaultValue: informationsCommerciales?.siteInternet || "",
              }}
            />
            <SmallNotice>
              Ajouter le lien de votre établissement peut permettre à celui-ci
              de se démarquer lorsque le candidat choisira son organisme
              accompagnateur.
            </SmallNotice>
          </div>
          <div>
            <Input
              className="!mb-4"
              label="E-mail de contact (optionnel)"
              nativeInputProps={{
                defaultValue: informationsCommerciales?.emailContact || "",
              }}
            />
            <SmallNotice>
              Cet e-mail sera également envoyé aux candidats dans le message
              récapitulant leur inscription.
            </SmallNotice>
          </div>
        </fieldset>
        <fieldset className="mt-8">
          <legend className="text-2xl font-bold mb-4">
            Adresse du lieu d’accueil (optionnel)
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-x-8">
            <Input
              label="Numéro et nom de rue (optionnel)"
              nativeInputProps={{
                defaultValue:
                  informationsCommerciales?.adresseNumeroEtNomDeRue || "",
              }}
            />
            <Input
              label="Informations complémentaires (optionnel)"
              nativeInputProps={{
                defaultValue:
                  informationsCommerciales?.adresseInformationsComplementaires ||
                  "",
              }}
            />
            <Input
              label="Code Postal (optionnel)"
              nativeInputProps={{
                defaultValue: informationsCommerciales?.adresseCodePostal || "",
              }}
            />
            <Input
              label="Ville (optionnel)"
              nativeInputProps={{
                defaultValue: informationsCommerciales?.adresseVille || "",
              }}
            />
          </div>
        </fieldset>

        <fieldset className="mt-8">
          <RadioButtons
            legend="Votre établissement est-il conforme aux normes d'accessibilité et peut
            recevoir du public à mobilité réduite ?"
            options={[
              {
                label: "Oui",
                nativeInputProps: {
                  value: "CONFORME",
                  defaultChecked:
                    informationsCommerciales?.conformeNormesAccessbilite ===
                    "CONFORME",
                },
              },
              {
                label: "Non",
                nativeInputProps: {
                  value: "NON_CONFORME",
                  defaultChecked:
                    informationsCommerciales?.conformeNormesAccessbilite ===
                    "NON_CONFORME",
                },
              },
              {
                label: "Cet établissement ne reçoit pas de public",
                nativeInputProps: {
                  value: "ETABLISSEMENT_NE_RECOIT_PAS_DE_PUBLIC",
                  defaultChecked:
                    informationsCommerciales?.conformeNormesAccessbilite ===
                    "ETABLISSEMENT_NE_RECOIT_PAS_DE_PUBLIC",
                },
              },
            ]}
          />
        </fieldset>

        <Button className="self-center md:self-end mt-8">
          Valider les modifications
        </Button>
      </form>
    </div>
  ) : null;
};

export default CommercialInformationPage;
