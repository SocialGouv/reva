"use client";
import { useCommercialInformationPage } from "@/app/(aap)/agencies-settings/[organismId]/commercial-information/commercialInformationPage.hook";
import { SmallNotice } from "@/components/small-notice/SmallNotice";
import { successToast } from "@/components/toast/toast";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const schema = z.object({
  nom: z.string().optional().default(""),
  telephone: z.string().optional().default(""),
  siteInternet: z.string().optional().default(""),
  emailContact: z
    .union([
      z
        .string()
        .length(0, "Le champ doit être vide ou contenir une adresse email"),
      z.string().email("Le champ doit être vide ou contenir une adresse email"),
    ])
    .optional()
    .default(""),
  adresseNumeroEtNomDeRue: z.string().optional().default(""),
  adresseInformationsComplementaires: z.string().optional().default(""),
  adresseCodePostal: z.string().optional().default(""),
  adresseVille: z.string().optional().default(""),
  conformeNormesAccessbilite: z
    .enum(["CONFORME", "NON_CONFORME", "ETABLISSEMENT_NE_RECOIT_PAS_DE_PUBLIC"])
    .nullable(),
});

type FormData = z.infer<typeof schema>;

const CommercialInformationPage = () => {
  const {
    informationsCommerciales,
    organismId,
    informationsCommercialesStatus,
    refetchInformationsCommerciales,
    createOrUpdateInformationsCommerciales,
  } = useCommercialInformationPage();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(
    () => reset(informationsCommerciales as FormData),
    [informationsCommerciales, reset],
  );

  const handleFormSubmit = handleSubmit(async (data) => {
    await createOrUpdateInformationsCommerciales.mutateAsync({
      organismId,
      ...data,
    });
    successToast("modifications enregistrées");
    await refetchInformationsCommerciales();
  });

  return (
    <div className="flex flex-col">
      <h1>Informations commerciales</h1>

      {informationsCommercialesStatus === "error" && (
        <Alert
          className="mb-6"
          severity="error"
          title="Une erreur est survenue pendant la récupération des informations commerciales."
        />
      )}
      {createOrUpdateInformationsCommerciales.status === "error" && (
        <Alert
          className="mb-6"
          severity="error"
          title="Une erreur est survenue pendant l'enregistrement des informations commerciales."
        />
      )}
      {informationsCommercialesStatus === "success" && (
        <>
          <Alert
            severity="info"
            title=""
            description="Les informations suivantes seront affichées aux candidats dans les résultats de recherche d’un AAP et dans le message récapitulant leur candidature. Si elles ne sont pas renseignées, les informations juridiques et administrateur seront prises par défaut."
          />

          <form
            className="flex flex-col mt-10"
            onSubmit={handleFormSubmit}
            onReset={(e) => {
              e.preventDefault();
              reset(informationsCommerciales as FormData);
            }}
          >
            <fieldset className="flex flex-col gap-4">
              <div>
                <Input
                  className="!mb-4"
                  label="Nom commercial (optionnel)"
                  nativeInputProps={{ ...register("nom") }}
                />
                <SmallNotice>
                  Si vous ne renseignez pas ce champ, votre raison sociale sera
                  affichée aux candidats par défaut.
                </SmallNotice>
              </div>
              <div>
                <Input
                  className="!mb-4"
                  label="Téléphone (optionnel)"
                  nativeInputProps={{
                    ...register("telephone"),
                  }}
                />
                <SmallNotice>
                  Ce numéro de téléphone sera également envoyé aux candidats
                  dans le message récapitulant leur inscription.
                </SmallNotice>
              </div>
              <div>
                <Input
                  className="!mb-4"
                  label="Site internet de l'établissement (optionnel)"
                  nativeInputProps={{
                    ...register("siteInternet"),
                  }}
                />
                <SmallNotice>
                  Ajouter le lien de votre établissement peut permettre à
                  celui-ci de se démarquer lorsque le candidat choisira son
                  organisme accompagnateur.
                </SmallNotice>
              </div>
              <div>
                <Input
                  className="!mb-4"
                  label="E-mail de contact (optionnel)"
                  state={errors.emailContact ? "error" : "default"}
                  stateRelatedMessage={errors.emailContact?.message}
                  nativeInputProps={{
                    ...register("emailContact"),
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
                    ...register("adresseNumeroEtNomDeRue"),
                  }}
                />
                <Input
                  label="Informations complémentaires (optionnel)"
                  nativeInputProps={{
                    ...register("adresseInformationsComplementaires"),
                  }}
                />
                <Input
                  label="Code Postal (optionnel)"
                  nativeInputProps={{
                    ...register("adresseCodePostal"),
                  }}
                />
                <Input
                  label="Ville (optionnel)"
                  nativeInputProps={{
                    ...register("adresseVille"),
                  }}
                />
              </div>
            </fieldset>

            <fieldset className="mt-8">
              <RadioButtons
                legend="Votre établissement est-il conforme aux normes d'accessibilité et peut
            recevoir du public à mobilité réduite (PMR) ?"
                options={[
                  {
                    label: "Oui",
                    nativeInputProps: {
                      value: "CONFORME",
                      ...register("conformeNormesAccessbilite"),
                    },
                  },
                  {
                    label: "Non",
                    nativeInputProps: {
                      value: "NON_CONFORME",
                      ...register("conformeNormesAccessbilite"),
                    },
                  },
                  {
                    label: "Cet établissement ne reçoit pas de public",
                    nativeInputProps: {
                      value: "ETABLISSEMENT_NE_RECOIT_PAS_DE_PUBLIC",
                      ...register("conformeNormesAccessbilite"),
                    },
                  },
                ]}
              />
            </fieldset>

            <div className="flex flex-col md:flex-row gap-4 self-center md:self-end mt-8">
              <Button priority="secondary" type="reset">
                Annuler les modifications
              </Button>
              <Button disabled={isSubmitting}>Valider les modifications</Button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default CommercialInformationPage;
