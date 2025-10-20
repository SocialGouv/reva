"use client";

import { Input } from "@codegouvfr/react-dsfr/Input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormButtons } from "@/components/form/form-footer/FormButtons";

const schema = z.object({
  accountFirstname: z.string().optional().default(""),
  accountLastname: z
    .string()
    .min(2, "Ce champ doit contenir au moins 2 caractères")
    .default(""),
  accountEmail: z
    .string()
    .email("Le champ doit contenir une adresse électronique valide")
    .default(""),

  contactFullName: z.string().min(1, "Merci de remplir ce champ"),
  contactEmail: z
    .string()
    .email("Le champ doit contenir une adresse électronique valide"),
  contactPhone: z.string().optional(),
});

export type LocalAccountFormData = z.infer<typeof schema>;

export const CertificationAuthorityLocalAccountGeneralInformationForm = ({
  className,
  backUrl,
  onSubmit,
  defaultValues,
  disableAccountFields,
}: {
  className?: string;
  backUrl: string;
  onSubmit: (data: LocalAccountFormData) => void;
  defaultValues?: LocalAccountFormData;
  disableAccountFields?: boolean;
}) => {
  const {
    register,
    handleSubmit,
    formState,
    formState: { errors },
  } = useForm<LocalAccountFormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const handleFormSubmit = handleSubmit(onSubmit, (e) => console.log(e));

  return (
    <form className={className || ""} onSubmit={handleFormSubmit}>
      <h2>Informations liées au compte local</h2>
      <p>
        Ces informations sont strictement confidentielles et ne seront pas
        partagées aux autres usagers de la plateforme.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        <Input
          data-test="account-lastname-input"
          label="Nom de la personne ou du compte"
          nativeInputProps={{ ...register("accountLastname") }}
          disabled={disableAccountFields}
          state={errors.accountLastname ? "error" : "default"}
          stateRelatedMessage={errors.accountLastname?.message}
        />
        <Input
          data-test="account-firstname-input"
          label="Prénom (optionnel)"
          nativeInputProps={{ ...register("accountFirstname") }}
          disabled={disableAccountFields}
          state={errors.accountFirstname ? "error" : "default"}
          stateRelatedMessage={errors.accountFirstname?.message}
        />
        <Input
          data-test="account-email-input"
          label="Adresse électronique de connexion"
          nativeInputProps={{
            autoComplete: "email",
            ...register("accountEmail"),
          }}
          disabled={disableAccountFields}
          state={errors.accountEmail ? "error" : "default"}
          stateRelatedMessage={errors.accountEmail?.message}
        />
      </div>
      <h2 className="mt-8">Contact référent </h2>
      <p>
        Le contact référent est le service administratif pour le suivi des
        dossiers. Ses coordonnées seront transmises aux candidats et aux AAP à
        des étapes clés du parcours VAE (faisabilité, validation, jury) pour
        faciliter les échanges.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        <Input
          data-test="contact-full-name-input"
          className="col-span-full"
          label="Service associé "
          nativeInputProps={{ ...register("contactFullName") }}
          state={errors.contactFullName ? "error" : "default"}
          stateRelatedMessage={errors.contactFullName?.message}
        />
        <Input
          data-test="contact-email-input"
          label="Adresse électronique"
          nativeInputProps={{
            autoComplete: "email",
            ...register("contactEmail"),
          }}
          hintText="Privilégiez une adresse électronique pérenne pour faciliter les échanges avec les candidats et les AAP"
          state={errors.contactEmail ? "error" : "default"}
          stateRelatedMessage={errors.contactEmail?.message}
        />
        <Input
          data-test="contact-phone-input"
          className="md:max-w-[280px] md:mt-6"
          label="Téléphone (optionnel)"
          nativeInputProps={{
            autoComplete: "phone",
            ...register("contactPhone"),
          }}
          state={errors.contactPhone ? "error" : "default"}
          stateRelatedMessage={errors.contactPhone?.message}
        />
      </div>
      <FormButtons backUrl={backUrl} formState={formState} />
    </form>
  );
};
