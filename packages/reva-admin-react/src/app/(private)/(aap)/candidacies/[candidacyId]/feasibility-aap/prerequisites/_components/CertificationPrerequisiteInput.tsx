import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { UseFormRegister } from "react-hook-form";

import { PrerequisitesFormData } from "../page";

export const CertificationPrerequisiteInput = ({
  register,
  index,
  errorLabel,
  errorState,
  label,
}: {
  register: UseFormRegister<PrerequisitesFormData>;
  index: number;
  errorLabel?: string;
  errorState?: string;
  label: string;
}) => {
  return (
    <div className="border-b mt-6 border-dsfr-light-decisions-border-border-default-grey last:border-b-0">
      <input
        type="hidden"
        value={label}
        name={`certificationPrerequisites.${index}.label`}
      />
      <p className="m-0 mb-4 text-dsfrGray-labelGrey">{label}</p>
      <RadioButtons
        legend={
          <p className="mb-4 text-m">
            Le candidat est-il détenteur du pré-requis exigé ?
          </p>
        }
        orientation="horizontal"
        state={errorState ? "error" : "default"}
        stateRelatedMessage={errorLabel}
        options={[
          {
            label: "Oui",
            nativeInputProps: {
              value: "ACQUIRED",
              ...register(`certificationPrerequisites.${index}.state`),
            },
          },
          {
            label: "Non",
            nativeInputProps: {
              value: "IN_PROGRESS",
              ...register(`certificationPrerequisites.${index}.state`),
            },
          },
        ]}
        small
      />
    </div>
  );
};
