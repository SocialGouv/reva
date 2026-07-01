"use client";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import Input from "@codegouvfr/react-dsfr/Input";
import Select from "@codegouvfr/react-dsfr/Select";

import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { Panel } from "@/components/layout/Panel";
import { FormOptionalFieldsDisclaimer } from "@/components/legacy/atoms/FormOptionalFieldsDisclaimer/FormOptionalFieldsDisclaimer";

import { useSetFormations } from "./set-formations.hooks";

const CandidateProfilePage = () => {
  const {
    degrees,
    register,
    handleFormSubmit,
    resetForm,
    watch,
    formState: { errors, isSubmitting },
  } = useSetFormations();

  const highestDegreeId = watch("highestDegreeId");
  const niveauDeFormationLePlusEleveDegreeId = watch(
    "niveauDeFormationLePlusEleveDegreeId",
  );

  return (
    <Panel>
      <div className="flex flex-col">
        <Breadcrumb
          currentPageLabel="Formations"
          className="mb-0"
          segments={[
            {
              label: "Ma candidature",
              linkProps: {
                href: "../",
              },
            },
          ]}
        />
        <h1 className="mt-4 mb-0">Formations</h1>
        <FormOptionalFieldsDisclaimer />

        <p className="mb-12 text-xl">
          Ces informations seront automatiquement transmises au certificateur,
          lorsque vous enverrez votre dossier de faisabilité
        </p>

        <form
          onSubmit={handleFormSubmit}
          onReset={(e) => {
            e.preventDefault();
            resetForm();
          }}
        >
          <div className="grid grid-cols-4 gap-6">
            <div className="col-span-3 flex flex-col">
              <fieldset>
                <Select
                  label="Niveau de formation le plus élevé"
                  hint="Indiquez le niveau d’études le plus élevé, même si le diplôme n’a pas été obtenu à la fin de la formation."
                  nativeSelectProps={{
                    ...register("niveauDeFormationLePlusEleveDegreeId"),
                  }}
                  state={
                    errors.niveauDeFormationLePlusEleveDegreeId
                      ? "error"
                      : "default"
                  }
                  stateRelatedMessage={
                    errors.niveauDeFormationLePlusEleveDegreeId?.message
                  }
                >
                  <option
                    value=""
                    disabled={!!niveauDeFormationLePlusEleveDegreeId}
                    hidden={!!niveauDeFormationLePlusEleveDegreeId}
                  >
                    Sélectionner un niveau
                  </option>
                  {degrees?.map((d) => (
                    <option key={d.id} value={d.id}>
                      Niveau {d.level}
                    </option>
                  ))}
                </Select>
                <Select
                  label="Niveau de la certification obtenue le plus élevé"
                  hint="Indiquez le niveau de diplôme le plus élevé obtenu."
                  nativeSelectProps={{
                    ...register("highestDegreeId"),
                  }}
                  state={errors.highestDegreeId ? "error" : "default"}
                  stateRelatedMessage={errors.highestDegreeId?.message}
                >
                  <option
                    value=""
                    disabled={!!highestDegreeId}
                    hidden={!!highestDegreeId}
                  >
                    Sélectionner un niveau
                  </option>
                  {degrees?.map((d) => (
                    <option key={d.id} value={d.id}>
                      Niveau {d.level}
                    </option>
                  ))}
                </Select>
                <Input
                  label="Intitulé de la certification la plus élevée obtenue"
                  nativeInputProps={{ ...register("highestDegreeLabel") }}
                  state={errors.highestDegreeLabel ? "error" : "default"}
                  stateRelatedMessage={errors.highestDegreeLabel?.message}
                />
              </fieldset>
            </div>

            <div className="col-span-1">
              <div className="flex flex-col px-4 pt-4 pb-2 bg-dsfr-light-decisions-background-background-alt-blue-france">
                <h6>Ressources :</h6>

                <div>
                  <p className="font-bold mb-2">Besoin d'aide ?</p>
                  <p>
                    Retrouvez la correspondance des niveaux sur le site du
                    service public :<br />
                    <a
                      className="fr-link"
                      href="https://www.service-public.gouv.fr/particuliers/vosdroits/F199"
                      target="_blank"
                    >
                      Nomenclature des diplômes
                    </a>
                    .
                  </p>

                  <hr />
                  <p>
                    <a
                      className="fr-link"
                      href="https://scribehow.com/viewer/Tutoriel__Candidat_sans_accompagnement_autonome__0NQyq175SDaI0Epy7bdyLA?referrer=documents&mode=edit"
                      target="_blank"
                    >
                      Consultez le guide pas à pas
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <FormButtons
            hideResetButton
            backUrl="../"
            formState={{ isSubmitting }}
          />
        </form>
      </div>
    </Panel>
  );
};

export default CandidateProfilePage;
