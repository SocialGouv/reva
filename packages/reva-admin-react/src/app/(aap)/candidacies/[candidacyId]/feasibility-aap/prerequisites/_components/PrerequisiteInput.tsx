import Input from "@codegouvfr/react-dsfr/Input";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { UseFormRegister } from "react-hook-form";
import { PrerequisitesFormData } from "../page";

export const PrerequisiteInput = ({
  register,
  index,
  onDelete,
  errorLabel,
  errorState,
}: {
  register: UseFormRegister<PrerequisitesFormData>;
  index: number;
  onDelete: () => void;
  errorLabel?: string;
  errorState?: string;
}) => {
  return (
    <div>
      <Input
        label="Intitulé du pré-requis :"
        nativeTextAreaProps={register(`prerequisites.${index}.label`)}
        state={errorLabel ? "error" : "default"}
        stateRelatedMessage={errorLabel}
        textArea
      />
      <div className="flex justify-between my-4">
        <RadioButtons
          className="m-0"
          orientation="horizontal"
          state={errorState ? "error" : "default"}
          stateRelatedMessage={errorState}
          options={[
            {
              label: "Acquis",
              nativeInputProps: {
                value: "ACQUIRED",
                ...register(`prerequisites.${index}.state`),
              },
            },
            {
              label: "En cours d'obtention",
              nativeInputProps: {
                value: "IN_PROGRESS",
                ...register(`prerequisites.${index}.state`),
              },
            },
            {
              label: "À préconiser",
              nativeInputProps: {
                value: "RECOMMENDED",
                ...register(`prerequisites.${index}.state`),
              },
            },
          ]}
          small
        />
        <div
          className="flex gap-2 cursor-pointer text-blue-900 items-center"
          onClick={onDelete}
        >
          <span className="fr-icon-delete-bin-line fr-icon--sm" />
          <span className="text-sm font-medium">Supprimer</span>
        </div>
      </div>
      <hr className="my-4" />
    </div>
  );
};
