import { GRAPHQL_API_URL } from "@/config/config";
import { graphql } from "@/graphql/generated";
import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import Select from "@codegouvfr/react-dsfr/Select";
import { zodResolver } from "@hookform/resolvers/zod";
import request from "graphql-request";
import { useEffect, useState } from "react";
import { useController, useForm } from "react-hook-form";
import * as z from "zod";

const getDepartmentsQuery = graphql(`
  query getDepartments {
    getDepartments {
      id
      code
      label
    }
  }
`);

interface DepartmentOption {
  label: string;
  value: string;
}

const zodSchema = z.object({
  firstname: z.string().min(1, "Ce champ est obligatoire"),
  lastname: z.string().min(1, "Ce champ est obligatoire"),
  phone: z.string().min(10, "Veuillez entrer un numéro de téléphone valide"),
  email: z.string().email("Format attendu : nom@domaine.fr"),
  departmentId: z.string().min(1, "Ce champ est obligatoire"),
});

export type CandidateRegistrationFormSchema = z.infer<typeof zodSchema>;

export const CandidateRegistrationForm = ({
  onSubmit,
}: {
  onSubmit(form: CandidateRegistrationFormSchema): void;
}) => {
  const [availableDepartments, setAvailableDepartments] = useState<
    DepartmentOption[]
  >([]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CandidateRegistrationFormSchema>({
    resolver: zodResolver(zodSchema),
  });

  const departmentIdController = useController({
    name: "departmentId",
    control,
  });

  useEffect(() => {
    const initAvailableDepartments = async () =>
      setAvailableDepartments(
        (await request(GRAPHQL_API_URL, getDepartmentsQuery)).getDepartments
          .sort((a, b) => a.label.localeCompare(b.label))
          .map((d) => ({ label: d.label, value: d.id }))
      );
    initAvailableDepartments();
  }, []);

  return (
    <form
      data-testid="candidate-registration-form"
      className="flex flex-col"
      onSubmit={handleSubmit(onSubmit)}
    >
      <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
        <Input
          data-testid="candidate-registration-form-firstname-input"
          label="Prénom"
          state={errors.firstname ? "error" : "default"}
          stateRelatedMessage={errors.firstname?.message}
          nativeInputProps={{ ...register("firstname") }}
        />
        <Input
          data-testid="candidate-registration-form-lastname-input"
          label="Nom"
          state={errors.lastname ? "error" : "default"}
          stateRelatedMessage={errors.lastname?.message}
          nativeInputProps={{ ...register("lastname") }}
        />
        <Input
          className="md:mt-6"
          data-testid="candidate-registration-form-phone-input"
          label="Téléphone"
          state={errors.phone ? "error" : "default"}
          stateRelatedMessage={errors.phone?.message}
          nativeInputProps={{
            ...register("phone"),
            autoComplete: "phone",
            type: "phone",
          }}
        />
        <Input
          data-testid="candidate-registration-form-email-input"
          label="Email"
          hintText="Format attendu : nom@domaine.fr"
          state={errors.email ? "error" : "default"}
          stateRelatedMessage={errors.email?.message}
          nativeInputProps={{
            ...register("email"),
            autoComplete: "email",
            type: "email",
            spellCheck: "false",
          }}
        />
        <Select
          data-testid="candidate-registration-form-department-select"
          label="Département"
          hint="Entrez votre département de résidence"
          state={errors.departmentId ? "error" : "default"}
          stateRelatedMessage={errors.departmentId?.message}
          nativeSelectProps={{
            value: departmentIdController.field.value,
            onChange: departmentIdController.field.onChange,
          }}
        >
          {!departmentIdController.field.value && <option value={undefined} />}
          {availableDepartments.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </Select>
      </fieldset>
      <Button
        data-testid="candidate-registration-submit-button"
        className="self-center mt-8"
        type="submit"
      >
        Créez votre compte
      </Button>
    </form>
  );
};
