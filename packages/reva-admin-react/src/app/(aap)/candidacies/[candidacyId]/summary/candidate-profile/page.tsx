"use client";
import Input from "@codegouvfr/react-dsfr/Input";
import Select from "@codegouvfr/react-dsfr/Select";

import { useCandidateProfilePageLogic } from "@/app/(aap)/candidacies/[candidacyId]/summary/candidate-profile/candidateProfilePageLogic";
import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";

const CandidateProfilePage = () => {
  const {
    candidacyId,
    degrees,
    register,
    handleFormSubmit,
    resetForm,
    watch,
    formState: { errors, isDirty, isSubmitting },
  } = useCandidateProfilePageLogic();

  const highestDegreeId = watch("highestDegreeId");
  const niveauDeFormationLePlusEleveDegreeId = watch(
    "niveauDeFormationLePlusEleveDegreeId",
  );

  return (
    <div className="flex flex-col">
      <h1>Compléter le profil</h1>
      <FormOptionalFieldsDisclaimer />
      <form
        onSubmit={handleFormSubmit}
        onReset={(e) => {
          e.preventDefault();
          resetForm();
        }}
        className="flex flex-col mt-8"
      >
        <fieldset>
          <legend className="mb-6 font-bold text-lg">
            Niveau de formation du candidat
          </legend>
          <Select
            label="Niveau de formation le plus élevé"
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
            ></option>
            {degrees?.map((d) => (
              <option key={d.id} value={d.id}>
                Niveau {d.level}
              </option>
            ))}
          </Select>
          <Select
            label="Niveau de la certification obtenue le plus élevé"
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
            ></option>
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
          backUrl={`/candidacies/${candidacyId}/summary`}
          formState={{ isDirty, isSubmitting }}
        />
      </form>
    </div>
  );
};

export default CandidateProfilePage;
