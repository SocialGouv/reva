import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import { ReactNode } from "react";

const SmallNotice = ({ children }: { children: ReactNode }) => (
  <div className="text-blue-light-text-default-info flex items-start ">
    <span className="fr-icon--sm fr-icon-info-fill mr-2 -mt-[1px]" />
    <p className="text-sm">{children}</p>
  </div>
);

const CommercialInformationPage = () => (
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
          <Input className="!mb-4" label="Nom commercial (optionnel)" />
          <SmallNotice>
            Si vous ne renseignez pas ce champ, votre raison commerciale sera
            affichée par défaut.
          </SmallNotice>
        </div>
        <div>
          <Input className="!mb-4" label="Téléphone (optionnel)" />
          <SmallNotice>
            Ce numéro de téléphone sera également envoyé aux candidats dans le
            message récapitulant leur inscription.
          </SmallNotice>
        </div>
        <div>
          <Input
            className="!mb-4"
            label="Site internet de l'établissement (optionnel)"
          />
          <SmallNotice>
            Ajouter le lien de votre établissement peut permettre à celui-ci de
            se démarquer lorsque le candidat choisira son organisme
            accompagnateur.
          </SmallNotice>
        </div>
        <div>
          <Input className="!mb-4" label="E-mail de contact (optionnel)" />
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
          <Input label="Numéro et nom de rue (optionnel)" />
          <Input label="Informations complémentaires (optionnel)" />
          <Input label="Code Postal (optionnel)" />
          <Input label="Ville (optionnel)" />
        </div>
      </fieldset>

      <fieldset className="mt-8">
        <RadioButtons
          legend="Votre établissement est-il conforme aux normes d'accessibilité et peut
            recevoir du public à mobilité réduite ?
  "
          options={[
            {
              label: "Oui",
              nativeInputProps: {
                value: "yes",
              },
            },
            {
              label: "Non",
              nativeInputProps: {
                value: "no",
              },
            },
            {
              label: "Cet établissement ne reçoit pas de public",
              nativeInputProps: {
                value: "not-open-to-public",
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
);

export default CommercialInformationPage;
