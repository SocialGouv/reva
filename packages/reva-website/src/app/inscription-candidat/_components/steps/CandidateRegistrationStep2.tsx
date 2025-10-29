import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import Input from "@codegouvfr/react-dsfr/Input";
import Select from "@codegouvfr/react-dsfr/Select";
import { zodResolver } from "@hookform/resolvers/zod";
import request from "graphql-request";
import { useEffect, useState } from "react";
import { useController, useForm } from "react-hook-form";
import * as z from "zod";

import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";
import { GRAPHQL_API_URL } from "@/config/config";
import {
  sanitizedEmail,
  sanitizedPhone,
  sanitizedText,
} from "@/utils/input-sanitization";

import { graphql } from "@/graphql/generated";

const getDepartmentsQuery = graphql(`
  query getDepartments {
    getDepartments(elligibleVAE: true) {
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
  lastname: sanitizedText(),
  firstname: sanitizedText(),
  phone: sanitizedPhone(),
  email: sanitizedEmail(),
  departmentId: sanitizedText(),
  notSecteurPublic: z.boolean().refine((val) => val, {
    message:
      "Vous ne pouvez pas accéder à une VAE via France VAE si vous dépendez du secteur public.",
  }),
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
    reset,
    control,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<Step2FormData>({
    resolver: zodResolver(zodSchema),
    defaultValues: {
      lastname: "",
      firstname: "",
      phone: "",
      email: "",
      departmentId: "",
      notSecteurPublic: false,
    },
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
      onReset={(e) => {
        e.preventDefault();
        reset();
      }}
    >
      <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
        <Input
          label="Nom"
          state={errors.lastname ? "error" : "default"}
          stateRelatedMessage={errors.lastname?.message}
          nativeInputProps={{ ...register("lastname") }}
        />
        <Input
          label="Prénom"
          state={errors.firstname ? "error" : "default"}
          stateRelatedMessage={errors.firstname?.message}
          nativeInputProps={{ ...register("firstname") }}
        />
        <Input
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
          label="Adresse électronique de connexion"
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
      <div className="w-full">
        <Checkbox
          small
          options={[
            {
              label:
                "Je certifie ne pas être un agent de la fonction publique.",
              hintText: (
                <>
                  France VAE n'est pas encore disponible pour les fonctionnaires
                  et agents contractuels (de droit public ou privé).
                  <br />
                  Vous pouvez retrouver des informations auprès de vos
                  interlocuteurs RH habituels.
                </>
              ),
              nativeInputProps: {
                ...register("notSecteurPublic"),
              },
            },
          ]}
          state={errors.notSecteurPublic ? "error" : "default"}
          stateRelatedMessage={errors.notSecteurPublic?.message}
        />
      </div>
      <div className="sm:absolute bottom-10 right-0 flex self-end gap-4">
        <Button type="reset" priority="tertiary no outline" disabled={!isDirty}>
          Réinitialiser
        </Button>
        <Button
          data-testid="candidate-registration-submit-button"
          type="submit"
          disabled={isSubmitting || !isDirty}
        >
          Créer mon compte
        </Button>
      </div>
    </form>
  );
};
