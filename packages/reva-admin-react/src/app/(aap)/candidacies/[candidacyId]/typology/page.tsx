"use client";
import { CandidacyBackButton } from "@/components/candidacy-back-button/CandidacyBackButton";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { useTypologyPage } from "./typologyPage.hook";
import { Select } from "@codegouvfr/react-dsfr/Select";
import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert } from "@codegouvfr/react-dsfr/Alert";

const typologyFormSchema = z.object({
  typology: z.enum([
    "NON_SPECIFIE",
    "SALARIE_PRIVE",
    "DEMANDEUR_EMPLOI",
    "AIDANTS_FAMILIAUX",
    "BENEVOLE",
  ]),
});
type TypologyFormData = z.infer<typeof typologyFormSchema>;

const TypologyPage = () => {
  const { candidacy } = useTypologyPage();

  const { register, control } = useForm<TypologyFormData>({
    resolver: zodResolver(typologyFormSchema),
    defaultValues: {
      typology:
        (candidacy?.typology as TypologyFormData["typology"]) || "NON_SPECIFIE",
    },
  });

  const { typology } = useWatch({ control });

  return (
    <>
      <CandidacyBackButton candidacyId={candidacy?.id as string} />
      <h1>Définition du parcours</h1>
      <FormOptionalFieldsDisclaimer />
      <>
        <Select
          className="max-w-sm"
          label="Typologie"
          nativeSelectProps={{ ...register("typology") }}
        >
          <option value="NON_SPECIFIE" disabled>
            Sélectionner
          </option>
          <option value="SALARIE_PRIVE">Salarié du privé</option>
          <option value="DEMANDEUR_EMPLOI">Demandeur d'emploi</option>
          <option value="AIDANTS_FAMILIAUX">Aidant familial</option>
          <option value="BENEVOLE">Bénévole</option>
        </Select>
      </>
      {typology !== "NON_SPECIFIE" && (
        <>
          <span className="font-bold">Convention collective sélectionnée</span>
          <div className="flex flex-col mt-2 bg-gray-100 rounded-lg p-6 mb-8">
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
              <p className="text-gray-400 text-sm font-medium m-auto">
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
                Vous pouvez retrouver le nom de sa convention collective sur son
                bulletin de paie ou sur son contrat de travail.
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
        </>
      )}
    </>
  );
};

export default TypologyPage;
