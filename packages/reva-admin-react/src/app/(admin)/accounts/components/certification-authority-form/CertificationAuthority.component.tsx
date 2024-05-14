"use client";

import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";

import { zodResolver } from "@hookform/resolvers/zod";

import { errorToast, successToast } from "@/components/toast/toast";

import { useCertificationAuthorityForm } from "./CertificationAuthority.hook";

const schema = z.object({
  label: z.string().default(""),
  contactFullName: z.string().optional().default(""),
  contactEmail: z
    .string()
    .email("Le champ doit contenir une adresse email valide")
    .optional()
    .default(""),
});

type FormData = z.infer<typeof schema>;

interface Props {
  certificationAuthority: {
    id: string;
    label: string;
    contactFullName?: string | null;
    contactEmail?: string | null;
  };
}

const CertificationAuthorityForm = (props: Props) => {
  const { certificationAuthority } = props;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      label: certificationAuthority.label,
      contactFullName: certificationAuthority.contactFullName || "",
      contactEmail: certificationAuthority.contactEmail || "",
    },
  });

  const { updateCertificationAuthority } = useCertificationAuthorityForm();

  const handleFormSubmit = handleSubmit(async (data) => {
    try {
      await updateCertificationAuthority.mutateAsync({
        certificationAuthorityId: certificationAuthority.id,
        certificationAuthorityData: data,
      });

      successToast("L'autorité de certification a bien été mis à jour");
    } catch (error) {
      const errorMessage =
        (error as any)?.response?.errors?.[0]?.message ||
        '"Une erreur est survenue"';

      errorToast(errorMessage);
    }
  });

  return (
    <div>
      <h2>Informations structure</h2>

      <form className="flex flex-col gap-8" onSubmit={handleFormSubmit}>
        <fieldset className="flex flex-col">
          <Input
            className="flex-1"
            label="RAISON SOCIALE"
            nativeInputProps={{ ...register("label") }}
          />

          <Input
            className="flex-1"
            label="NOM COMPLET (OPTIONNEL)"
            nativeInputProps={{ ...register("contactFullName") }}
          />

          <Input
            className="flex-1"
            label="EMAIL DE CONTACT"
            state={errors.contactEmail ? "error" : "default"}
            stateRelatedMessage={errors.contactEmail?.message}
            nativeInputProps={{ ...register("contactEmail") }}
          />
        </fieldset>

        <div className="flex flex-row justify-end">
          <Button disabled={isSubmitting}>Enregistrer</Button>
        </div>
      </form>
    </div>
  );
};

export default CertificationAuthorityForm;
