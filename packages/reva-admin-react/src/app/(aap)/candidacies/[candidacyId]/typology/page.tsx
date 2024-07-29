"use client";
import { CandidacyBackButton } from "@/components/candidacy-back-button/CandidacyBackButton";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { useTypologyPage } from "./typologyPage.hook";
import { Select } from "@codegouvfr/react-dsfr/Select";
import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { CcnSearchList } from "./_components/ccn-search-list/CcnSearchList";
import { useEffect } from "react";
import { graphqlErrorToast } from "@/components/toast/toast";
import { useRouter } from "next/navigation";

const typologyFormSchema = z.object({
  typology: z.enum([
    "NON_SPECIFIE",
    "SALARIE_PRIVE",
    "BENEVOLE",
    "AIDANTS_FAMILIAUX",
    "AIDANTS_FAMILIAUX_AGRICOLES",
    "DEMANDEUR_EMPLOI",
    "TRAVAILLEUR_NON_SALARIE",
    "TITULAIRE_MANDAT_ELECTIF",
  ]),
  ccnId: z.string().optional(),
});
type TypologyFormData = z.infer<typeof typologyFormSchema>;

const TypologyPage = () => {
  const router = useRouter();

  const { candidacy, submitTypologyForm } = useTypologyPage();

  const { register, control, setValue, handleSubmit, reset } =
    useForm<TypologyFormData>({
      resolver: zodResolver(typologyFormSchema),
      defaultValues: {
        typology:
          (candidacy?.typology as TypologyFormData["typology"]) ||
          "NON_SPECIFIE",
        ccnId: candidacy?.conventionCollective?.id,
      },
    });

  const { typology } = useWatch({ control });

  const handleCcnChoice = (ccnId: string) => {
    setValue("ccnId", ccnId);
    handleFormSubmit();
  };

  const handleFormSubmit = handleSubmit(async (data) => {
    try {
      await submitTypologyForm.mutateAsync(data);
      router.push(`/candidacies/${candidacy?.id}/training`);
    } catch (e) {
      graphqlErrorToast(e);
    }
  });

  useEffect(
    () =>
      reset({
        typology:
          (candidacy?.typology as TypologyFormData["typology"]) ||
          "NON_SPECIFIE",
        ccnId: candidacy?.conventionCollective?.id,
      }),
    [candidacy, reset],
  );

  return (
    <>
      <CandidacyBackButton candidacyId={candidacy?.id as string} />
      <h1>Définition du parcours</h1>
      <FormOptionalFieldsDisclaimer />
      <form className="flex flex-col" onSubmit={handleFormSubmit}>
        <Select
          className="max-w-sm"
          label="Typologie"
          nativeSelectProps={{ ...register("typology") }}
        >
          <option value="NON_SPECIFIE" disabled>
            Sélectionner
          </option>

          <option value="SALARIE_PRIVE">Salarié du privé</option>
          <option value="BENEVOLE">Bénévole</option>
          <option value="AIDANTS_FAMILIAUX">Aidant familial</option>
          <option value="AIDANTS_FAMILIAUX_AGRICOLES">
            Aidant familial agricole
          </option>
          <option value="DEMANDEUR_EMPLOI">Demandeur d'emploi</option>
          <option value="TRAVAILLEUR_NON_SALARIE">
            Travailleur non salarié
          </option>
          <option value="TITULAIRE_MANDAT_ELECTIF">
            Titulaire d'un mandat électif (électoral ou syndical)
          </option>
        </Select>
        {(typology === "SALARIE_PRIVE" ||
          typology === "DEMANDEUR_EMPLOI" ||
          typology === "TRAVAILLEUR_NON_SALARIE" ||
          typology === "TITULAIRE_MANDAT_ELECTIF") && (
          <>
            <span className="font-bold">
              Convention collective sélectionnée
            </span>
            <div className="flex flex-col mt-2 bg-gray-100 rounded-xl p-4 mb-10">
              {candidacy?.conventionCollective ? (
                <>
                  <p className="m-0 text-gray-500">
                    {candidacy.conventionCollective.idcc}
                  </p>
                  <p className="m-0 font-bold">
                    {candidacy.conventionCollective.label}
                  </p>
                </>
              ) : (
                <p className="text-gray-400 text-sm font-medium m-auto p-2">
                  Aucune convention collective sélectionnée
                </p>
              )}
            </div>
            <p className="uppercase font-bold text-xs mb-2">
              CONVENTION COLLECTIVE (UNE SEULE CONVENTION POUR UN CANDIDAT)
            </p>
            <Alert
              severity="info"
              title="Comment trouver la convention collective ?"
              description={
                <p>
                  Vous pouvez retrouver le nom de sa convention collective sur
                  son bulletin de paie ou sur son contrat de travail.
                  <br />
                  <a
                    className="fr-link"
                    href="https://code.travail.gouv.fr/outils/convention-collective"
                    target="_blank"
                  >
                    Retrouvez la liste complète sur le site du code du travail
                  </a>
                </p>
              }
            />
            <p className="mt-8 mb-2">
              Recherchez parmi les conventions collectives disponibles
            </p>
            <CcnSearchList onCcnButtonClick={handleCcnChoice} />
          </>
        )}

        {(typology === "BENEVOLE" ||
          typology === "AIDANTS_FAMILIAUX" ||
          typology === "AIDANTS_FAMILIAUX_AGRICOLES") && (
          <Button className="ml-auto">Suivant</Button>
        )}
      </form>
    </>
  );
};

export default TypologyPage;
