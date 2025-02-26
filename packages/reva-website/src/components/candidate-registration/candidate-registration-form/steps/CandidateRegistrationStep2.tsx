import { graphql } from "@/graphql/generated";
import Input from "@codegouvfr/react-dsfr/Input";
import Select from "@codegouvfr/react-dsfr/Select";
import Button from "@codegouvfr/react-dsfr/Button";
import { zodResolver } from "@hookform/resolvers/zod";
import request from "graphql-request";
import { useEffect, useState } from "react";
import { useController, useForm } from "react-hook-form";
import * as z from "zod";
import { GRAPHQL_API_URL } from "@/config/config";
import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";
import Alert from "@codegouvfr/react-dsfr/Alert";

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
  lastname: z.string().min(1, "Merci de remplir ce champ"),
  firstname: z.string().min(1, "Merci de remplir ce champ"),
  phone: z.string().min(10, "Veuillez entrer un numéro de téléphone valide"),
  email: z.string().email("Format attendu : nom@domaine.fr"),
  departmentId: z
    .string({
      required_error: "Merci de remplir ce champ",
    })
    .min(1, "Merci de remplir ce champ"),
});

type Step2FormData = z.infer<typeof zodSchema>;

export const CandidateRegistrationStep2 = ({
  onSubmit,
}: {
  onSubmit: (data: Step2FormData) => void;
}) => {
  const { isFeatureActive } = useFeatureflipping();

  const [availableDepartments, setAvailableDepartments] = useState<
    DepartmentOption[]
  >([]);

  const candidacyCreationDisabled = isFeatureActive(
    "CANDIDACY_CREATION_DISABLED",
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Step2FormData>({
    resolver: zodResolver(zodSchema),
  });

  const departmentIdController = useController({
    name: "departmentId",
    control,
  });

  useEffect(() => {
    const initAvailableDepartments = async () => {
      const data = await request(GRAPHQL_API_URL, getDepartmentsQuery);
      setAvailableDepartments(
        data.getDepartments
          .sort((a, b) => a.label.localeCompare(b.label))
          .map((d) => ({ label: d.label, value: d.id })),
      );
    };
    initAvailableDepartments();
  }, []);

  const handleFormSubmit = handleSubmit(onSubmit);

  if (candidacyCreationDisabled) {
    return (
      <Alert
        severity="warning"
        data-testid="registration-disabled-error"
        className="basis-1/2"
        title={
          <p className="font-normal">
            En raison d'une mise à jour technique, le service d'inscription est
            actuellement indisponible.
          </p>
        }
      />
    );
  }

  return (
    <form
      data-testid="candidate-registration-form"
      className="flex flex-col gap-8"
      onSubmit={handleFormSubmit}
    >
      <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
        <Input
          data-testid="candidate-registration-form-lastname-input"
          label="Nom"
          state={errors.lastname ? "error" : "default"}
          stateRelatedMessage={errors.lastname?.message}
          nativeInputProps={{ ...register("lastname") }}
        />
        <Input
          data-testid="candidate-registration-form-firstname-input"
          label="Prénom"
          state={errors.firstname ? "error" : "default"}
          stateRelatedMessage={errors.firstname?.message}
          nativeInputProps={{ ...register("firstname") }}
        />
        <Input
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
          label="Email (utilisé pour la connexion)"
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
          state={errors.departmentId ? "error" : "default"}
          stateRelatedMessage={errors.departmentId?.message}
          nativeSelectProps={{
            value: departmentIdController.field.value,
            onChange: departmentIdController.field.onChange,
          }}
        >
          {!departmentIdController.field.value && (
            <option value="">Sélectionner votre département</option>
          )}
          {availableDepartments.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </Select>
      </fieldset>
      <div className="sm:absolute bottom-10 right-0 flex self-end gap-4">
        <Button priority="tertiary no outline" type="reset">
          Réinitialiser
        </Button>
        <Button
          data-testid="candidate-registration-submit-button"
          type="submit"
        >
          Créer mon compte
        </Button>
      </div>
    </form>
  );
};
