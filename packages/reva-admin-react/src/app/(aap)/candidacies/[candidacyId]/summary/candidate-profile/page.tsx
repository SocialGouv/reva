"use client";
import { useCandidateProfilePageLogic } from "@/app/(aap)/candidacies/[candidacyId]/summary/candidate-profile/candidateProfilePageLogic";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import Select from "@codegouvfr/react-dsfr/Select";

const CandidateProfilePage = () => {
  const {
    degrees,
    highestDegreeLevelController,
    niveauDeFormationLePlusEleveController,
    register,
    handleFormSubmit,
    errors,
    isSubmitting,
    resetForm,
  } = useCandidateProfilePageLogic();

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
              onChange: (event) =>
                niveauDeFormationLePlusEleveController.field.onChange(
                  event.target.value,
                ),
              value: niveauDeFormationLePlusEleveController.field.value,
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
              disabled={!!niveauDeFormationLePlusEleveController.field.value}
              hidden={!!niveauDeFormationLePlusEleveController.field.value}
            ></option>
            {degrees?.map((d) => (
              <option key={d.id} value={d.id}>
                {d.longLabel}
              </option>
            ))}
          </Select>
          <Select
            label="Niveau de la certification obtenue le plus élevé"
            nativeSelectProps={{
              onChange: (event) =>
                highestDegreeLevelController.field.onChange(event.target.value),
              value: highestDegreeLevelController.field.value,
            }}
            state={errors.highestDegreeId ? "error" : "default"}
            stateRelatedMessage={errors.highestDegreeId?.message}
          >
            <option
              value=""
              disabled={!!highestDegreeLevelController.field.value}
              hidden={!!highestDegreeLevelController.field.value}
            ></option>
            {degrees?.map((d) => (
              <option key={d.id} value={d.id}>
                {d.longLabel}
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
        <div className="flex flex-col md:flex-row gap-4 items-center self-center md:self-end mt-10">
          <Button priority="secondary" type="reset">
            Annuler
          </Button>
          <Button disabled={isSubmitting}>Valider</Button>
        </div>
      </form>
    </div>
  );
};

export default CandidateProfilePage;
