import { Cgu } from "@/components/cgu/Cgu";
import { HardCodedCgu } from "@/components/cgu/HardCodedCgu";
import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";
import { FormOptionalFieldsDisclaimer } from "@/components/form/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { GetCguQuery } from "@/graphql/generated/graphql";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { useProfessionalSpaceSubscriptionContext } from "../context/ProfessionalSpaceSubscriptionContext";

const zodSchema = z.object({
  isCguCheckboxChecked: z.literal<boolean>(true),
});

type CguStepFormSchema = z.infer<typeof zodSchema>;

export const CguStep = ({
  getCguResponse,
}: {
  getCguResponse: GetCguQuery;
}) => {
  const { professionalSpaceInfos, submitCguStep } =
    useProfessionalSpaceSubscriptionContext();
  const {
    register,
    handleSubmit,
    formState: { isValid },
  } = useForm<CguStepFormSchema>({
    resolver: zodResolver(zodSchema),
    defaultValues: {
      ...professionalSpaceInfos,
    },
  });

  const { isFeatureActive, status } = useFeatureflipping();
  const showFromStrapi = isFeatureActive("CGU_FROM_STRAPI");
  if (status !== "INITIALIZED") {
    return null;
  }

  const alertDescription = (
    <>
      <p>
        Nous vous proposons plusieurs ressources pour démarrer votre inscription
        en toute sérénité :
      </p>
      <ul>
        <li>
          Une présentation à suivre pour répondre rapidement à vos questions et
          valider votre inscription
        </li>
        <li>
          Notre{" "}
          <a
            target="_blank"
            href="https://scribehow.com/shared/Creation_dun_compte_Architecte_Accompagnateur_de_Parcours_sur_France_VAE__7qPWB2zFT2yYOz_Zy0NRnA?referrer=workspace"
          >
            guide
          </a>{" "}
          de création de compte Architecte Accompagnateur de Parcours (AAP)
        </li>
      </ul>
      <p>
        Et si vous n’avez pas obtenu toutes les réponses à vos questions, nous
        restons disponibles à l’adresse{" "}
        <a href="mailto:support@vae.gouv.fr">support@vae.gouv.fr</a>.
      </p>
    </>
  );

  return (
    <>
      <h1>
        Création de compte administrateur - Architecte Accompagnateur de
        Parcours
        <FormOptionalFieldsDisclaimer />
      </h1>
      <p className="text-xl mt-8 mb-12">
        Bienvenue sur la page de création de compte professionnel de France VAE.
        Suivez les prochaines étapes pour rejoindre la communauté des
        Archirectes Accompagnateurs de Parcours !
      </p>
      <Alert
        className="mb-12"
        closable
        description={alertDescription}
        severity="info"
        title="Besoin d’aide pour la création de votre compte ?"
      />
      <hr className="mb-6" />
      <form className="flex flex-col" onSubmit={handleSubmit(submitCguStep)}>
        <fieldset className="flex flex-col  ">
          <legend>
            <h2>
              Pour créer votre compte, vous devez accepter les conditions
              générales d'utilisation
            </h2>
          </legend>
          {showFromStrapi ? (
            <Cgu
              cguHtml={
                getCguResponse?.legals?.data[0]?.attributes?.contenu ?? ""
              }
              chapo={getCguResponse?.legals?.data[0]?.attributes?.chapo ?? ""}
              updatedAt={
                getCguResponse?.legals?.data[0]?.attributes?.dateDeMiseAJour
              }
            />
          ) : (
            <HardCodedCgu />
          )}
          <Checkbox
            className="!mt-2"
            options={[
              {
                label:
                  "J'atteste avoir pris connaissance des Conditions Générales d’Utilisation.",
                nativeInputProps: {
                  ...register("isCguCheckboxChecked"),
                },
              },
            ]}
          />
        </fieldset>
        <div className="flex gap-2 ml-auto mt-4">
          <Button type="submit" disabled={!isValid}>
            Commencer
          </Button>
        </div>
      </form>
    </>
  );
};
