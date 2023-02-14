import { Stepper } from "@codegouvfr/react-dsfr/Stepper";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useProfessionalSpaceCreationContext } from "../context/ProfessionalSpaceCreationContext";

const zodSchema = z.object({
  companyBic: z.string().length(8, "8 caractères"),
  companyIban: z
    .string()
    .min(1, "obligatoire")
    .max(34, "34 caractères maximum"),
});

type StepThreeFormSchema = z.infer<typeof zodSchema>;

export const StepThreeForm = () => {
  const { professionalSpaceInfos, goBackToPreviousStep, submitStepThree } =
    useProfessionalSpaceCreationContext();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StepThreeFormSchema>({
    resolver: zodResolver(zodSchema),
    defaultValues: { ...professionalSpaceInfos },
  });

  const handleFormSubmit = (data: StepThreeFormSchema) => submitStepThree(data);

  return (
    <div className="flex flex-col min-w-[70vw]">
      <Stepper
        title="Saisir vos informations confidentielles"
        currentStep={3}
        stepCount={3}
      />
      <div className="border-t border-gray-300  mb-7" />
      <form className="flex flex-col" onSubmit={handleSubmit(handleFormSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          <Input
            label="BIC *"
            state={errors.companyBic ? "error" : "default"}
            stateRelatedMessage={errors.companyBic?.message}
            nativeInputProps={{ ...register("companyBic") }}
          />
          <Input
            label="IBAN *"
            state={errors.companyIban ? "error" : "default"}
            stateRelatedMessage={errors.companyIban?.message}
            nativeInputProps={{ ...register("companyIban") }}
          />
        </div>
        <div className="flex gap-2 ml-auto mt-4">
          <Button priority="secondary" onClick={goBackToPreviousStep}>
            Précédent
          </Button>
          <Button type="submit">Valider</Button>
        </div>
      </form>
    </div>
  );
};
