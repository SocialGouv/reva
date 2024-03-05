"use client";

import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";

import { zodResolver } from "@hookform/resolvers/zod";

import { errorToast, successToast } from "@/components/toast/toast";

import { useOrganismForm } from "./OrganismForm.hook";

const schema = z.object({
  label: z.string().default(""),
  contactAdministrativeEmail: z
    .string()
    .email("Le champ doit contenir une adresse email valide")
    .default(""),
  contactAdministrativePhone: z.string().optional().default(""),
  website: z.string().optional().default(""),
  isActive: z.enum(["Activé", "Désactivé"]),
});

type FormData = z.infer<typeof schema>;

interface Props {
  organism: {
    id: string;
    label: string;
    contactAdministrativeEmail: string;
    contactAdministrativePhone?: string | null;
    website?: string | null;
    isActive: boolean;
  };
}

const OrganismForm = (props: Props) => {
  const { organism } = props;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      label: organism.label,
      contactAdministrativeEmail: organism.contactAdministrativeEmail || "",
      contactAdministrativePhone: organism.contactAdministrativePhone || "",
      website: organism.website || "",
      isActive: organism.isActive ? "Activé" : "Désactivé",
    },
  });

  const { updateOrganism } = useOrganismForm();

  const handleFormSubmit = handleSubmit(async (data) => {
    try {
      await updateOrganism.mutateAsync({
        organismId: organism.id,
        organismData: {
          ...data,
          isActive: data.isActive == "Activé",
        },
      });

      successToast("La structure a bien été mis à jour");
    } catch (error) {
      const errorMessage =
        (error as any)?.response?.errors?.[0]?.message ||
        '"Une erreur est survenue"';

      errorToast(errorMessage);
    }
  });

  return (
    <div>
      <h2 className="text-l font-bold my-4">Informations structure</h2>

      <form className="flex flex-col gap-8" onSubmit={handleFormSubmit}>
        <Input
          className="flex-1"
          label="RAISON SOCIALE"
          nativeInputProps={{ ...register("label") }}
        />

        <fieldset className="flex flex-row justify-between">
          <Input
            className="flex-1"
            label="EMAIL DE CONTACT"
            state={errors.contactAdministrativeEmail ? "error" : "default"}
            stateRelatedMessage={errors.contactAdministrativeEmail?.message}
            nativeInputProps={{ ...register("contactAdministrativeEmail") }}
          />

          <div className="w-4" />

          <Input
            className="flex-1"
            label="TÉLÉPHONE (OPTIONNEL)"
            nativeInputProps={{ ...register("contactAdministrativePhone") }}
          />

          <div className="w-4" />

          <Input
            className="flex-1"
            label="WEBSITE (OPTIONNEL)"
            nativeInputProps={{ ...register("website") }}
          />
        </fieldset>

        <RadioButtons
          legend="Statut de la structure"
          orientation="horizontal"
          options={[
            {
              label: "Activé",
              nativeInputProps: {
                value: "Activé",
                ...register("isActive"),
              },
            },
            {
              label: "Désactivé",
              nativeInputProps: {
                value: "Désactivé",
                ...register("isActive"),
              },
            },
          ]}
        />

        <div className="flex flex-row justify-end">
          <Button disabled={isSubmitting}>Enregistrer</Button>
        </div>
      </form>
    </div>
  );
};

export default OrganismForm;
