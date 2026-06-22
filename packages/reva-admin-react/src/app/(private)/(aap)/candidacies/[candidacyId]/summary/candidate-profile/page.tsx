"use client";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import Input from "@codegouvfr/react-dsfr/Input";
import Select from "@codegouvfr/react-dsfr/Select";

import { useCandidateProfilePageLogic } from "@/app/(private)/(aap)/candidacies/[candidacyId]/summary/candidate-profile/candidateProfilePageLogic";
import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";

const CandidateProfilePage = () => {
  const {
    candidacyId,
    degrees,
    candidate,
    register,
    handleFormSubmit,
    resetForm,
    watch,
    formState: { errors, isSubmitting },
  } = useCandidateProfilePageLogic();

  const highestDegreeId = watch("highestDegreeId");
  const niveauDeFormationLePlusEleveDegreeId = watch(
    "niveauDeFormationLePlusEleveDegreeId",
  );

  return (
    <div className="flex flex-col">
      <Breadcrumb
        className="mb-4"
        currentPageLabel="Formations"
        segments={[
          {
            label: (
              <span>
                {candidate?.givenName
                  ? candidate.givenName
                  : candidate?.lastname}{" "}
                {candidate?.firstname}
              </span>
            ),
            linkProps: { href: "../" },
          },
        ]}
      />
      <h1>Formations</h1>
      <FormOptionalFieldsDisclaimer />
      <form
        onSubmit={handleFormSubmit}
        onReset={(e) => {
          e.preventDefault();
          resetForm();
        }}
        className="flex flex-col"
      >
        <fieldset>
          <p className="mb-12 text-xl">
            Ces informations seront automatiquement transmises au certificateur,
            lorsque vous enverrez votre dossier de faisabilité
          </p>
          <Select
            label="Niveau de formation le plus élevé"
            hint="Indiquez le niveau d’études le plus élevé, même si le diplôme n’a pas été obtenu à la fin de la formation."
            nativeSelectProps={{
              ...register("niveauDeFormationLePlusEleveDegreeId"),
            }}
            state={
              errors.niveauDeFormationLePlusEleveDegreeId ? "error" : "default"
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
        <FormButtons
          hideResetButton
          backUrl={`/candidacies/${candidacyId}/summary`}
          formState={{ isSubmitting }}
        />
      </form>
    </div>
  );
};

export default CandidateProfilePage;
