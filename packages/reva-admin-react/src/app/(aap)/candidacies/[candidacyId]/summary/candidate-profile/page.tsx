"use client";
import { useCandidateProfilePageLogic } from "@/app/(aap)/candidacies/[candidacyId]/summary/candidate-profile/candidateProfilePageLogic";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { PageTitle } from "@/components/page/page-title/PageTitle";
import Button from "@codegouvfr/react-dsfr/Button";
import Select from "@codegouvfr/react-dsfr/Select";

const CandidateProfilePage = () => {
  const {
    degrees,
    highestDegreeLevelController,
    handleFormSubmit,
    errors,
    isSubmitting,
    resetForm,
  } = useCandidateProfilePageLogic();

  console.log(highestDegreeLevelController.field.value);
  return (
    <div className="flex flex-col">
      <PageTitle className="!mb-4 md:!mt-0">Compléter le profil</PageTitle>
      <FormOptionalFieldsDisclaimer />
      <form
        onSubmit={handleFormSubmit}
        onReset={resetForm}
        className="flex flex-col mt-8"
      >
        <fieldset>
          <legend className="mb-6 font-bold text-lg">
            Niveau de formation du candidat
          </legend>
          <Select
            label="Niveau de la certification obtenue le plus élevé"
            nativeSelectProps={{
              onChange: (event) =>
                highestDegreeLevelController.field.onChange(event.target.value),
              value: highestDegreeLevelController.field.value,
            }}
            state={errors.highestDegreeLevelId ? "error" : "default"}
            stateRelatedMessage={errors.highestDegreeLevelId?.message}
          >
            <option
              value=""
              disabled={!!highestDegreeLevelController.field.value}
            ></option>
            {degrees?.map((d) => (
              <option key={d.id} value={d.id}>
                {d.longLabel}
              </option>
            ))}
          </Select>
        </fieldset>
        <div className="flex flex-col md:flex-row gap-4 self-center md:self-end mt-10">
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
