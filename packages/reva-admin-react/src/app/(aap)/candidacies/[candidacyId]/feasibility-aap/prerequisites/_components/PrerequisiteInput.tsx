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
    <div data-testid={`prerequisite-input-${index}`}>
      <Input
        className="m-0"
        label="Intitulé du prérequis :"
        nativeTextAreaProps={register(`aapPrerequisites.${index}.label`)}
        state={errorLabel ? "error" : "default"}
        stateRelatedMessage={errorLabel}
        textArea
      />
      <div className="flex flex-col justify-between my-4">
        <RadioButtons
          legend="Le candidat est-il détenteur de ce pré-requis ?"
          className="m-0 p-0"
          orientation="horizontal"
          state={errorState ? "error" : "default"}
          stateRelatedMessage={errorState}
          options={[
            {
              label: "Oui",
              nativeInputProps: {
                value: "ACQUIRED",
                ...register(`aapPrerequisites.${index}.state`),
              },
            },
            {
              label: "Non",
              nativeInputProps: {
                value: "IN_PROGRESS",
                ...register(`aapPrerequisites.${index}.state`),
              },
            },
          ]}
          small
        />
        <div
          className="flex gap-2 cursor-pointer text-blue-900 items-center self-end"
          onClick={onDelete}
          data-testid={`delete-prerequisite-button-${index}`}
        >
          <span className="fr-icon-delete-bin-line fr-icon--sm" />
          <span className="text-sm font-medium">Supprimer</span>
        </div>
      </div>
      <hr className="mt-4 mb-0" />
    </div>
  );
};
