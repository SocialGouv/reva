import Input from "@codegouvfr/react-dsfr/Input";
import { useFormContext } from "react-hook-form";

export const ResponsableFinancementBlock = ({
  isReadOnly,
}: {
  isReadOnly: boolean;
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="w-full">
      <legend>
        <h2 className="text-xl">4. Responsable du financement</h2>
      </legend>
      <fieldset className="grid grid-cols-2 gap-x-4 w-full">
        <Input
          label="Nom (optionnel)"
          nativeInputProps={register("fundingContactFirstname")}
          stateRelatedMessage={
            errors.fundingContactFirstname?.message as string
          }
          state={errors.fundingContactFirstname ? "error" : "default"}
          disabled={isReadOnly}
        />
        <Input
          label="Prénom (optionnel)"
          nativeInputProps={register("fundingContactLastname")}
          stateRelatedMessage={errors.fundingContactLastname?.message as string}
          state={errors.fundingContactLastname ? "error" : "default"}
          disabled={isReadOnly}
        />
        <Input
          label="Téléphone (optionnel)"
          nativeInputProps={register("fundingContactPhone")}
          stateRelatedMessage={errors.fundingContactPhone?.message as string}
          state={errors.fundingContactPhone ? "error" : "default"}
          disabled={isReadOnly}
        />
        <Input
          label="Adresse mail (optionnel)"
          nativeInputProps={register("fundingContactEmail")}
          stateRelatedMessage={errors.fundingContactEmail?.message as string}
          state={errors.fundingContactEmail ? "error" : "default"}
          disabled={isReadOnly}
        />
      </fieldset>
    </div>
  );
};
