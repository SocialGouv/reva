import { successToast, graphqlErrorToast } from "@/components/toast/toast";
import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useCertificationAuthorityForm } from "./certificationAuthorityGeneralInfoForm.hooks";
import { z } from "zod";

type FormData = z.infer<typeof schema>;

const schema = z.object({
  contactFullName: z.string().min(1, "Merci de remplir ce champ"),
  contactEmail: z
    .string()
    .email("Le champ doit contenir une adresse email valide"),
  contactPhone: z.string().optional(),
});

export const CertificationAuthorityGeneralInfoForm = ({
  certificationAuthority,
  backUrl,
}: {
  certificationAuthority: {
    id: string;
    label: string;
    contactFullName?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
    account?: {
      id: string;
      lastname?: string | null;
      firstname?: string | null;
      email: string;
    } | null;
  };
  backUrl: string;
}) => {
  const { updateCertificationAuthority } = useCertificationAuthorityForm();

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      contactFullName: certificationAuthority.contactFullName || undefined,
      contactEmail: certificationAuthority.contactEmail || undefined,
      contactPhone: certificationAuthority.contactPhone || undefined,
    },
  });

  const handleFormSubmit = handleSubmit(async (data) => {
    try {
      await updateCertificationAuthority.mutateAsync({
        certificationAuthorityId: certificationAuthority.id,
        certificationAuthorityData: data,
      });

      successToast("L'autorité de certification a bien été mise à jour");
    } catch (error) {
      graphqlErrorToast(error);
    }
  });

  return (
    <>
      <div className="flex flex-col gap-y-8">
        <div>
          <h2 className="mb-6">
            Informations liées au gestionnaire de candidature
          </h2>
          <p>
            Ces informations sont strictement confidentielles et ne seront pas
            partagées aux autres usagers de la plateforme.
          </p>
          <div className="flex flex-col">
            <Input
              label="Nom de la structure"
              nativeInputProps={{ value: certificationAuthority.label }}
              disabled
            />
            <div className="flex gap-4">
              <Input
                className="w-full"
                label="Nom"
                nativeInputProps={{
                  value: certificationAuthority.account?.lastname || "",
                }}
                disabled
              />
              <Input
                className="w-full"
                label="Prénom (optionnel)"
                nativeInputProps={{
                  value: certificationAuthority.account?.firstname || "",
                }}
                disabled
              />
            </div>
            <Input
              label="Email de connexion"
              nativeInputProps={{
                value: certificationAuthority.account?.email,
              }}
              disabled
              className="w-[calc(50%-0.5rem)]"
            />
          </div>
        </div>
        <div>
          <h2 className="mb-6">Contact référent</h2>
          <p>
            Le contact référent est le service administratif pour le suivi des
            dossiers. Ses coordonnées seront transmises aux candidats et aux AAP
            à des étapes clés du parcours VAE (faisabilité, validation, jury)
            pour faciliter les échanges.
          </p>
          <form onSubmit={handleFormSubmit} id="certificationAuthorityForm">
            <div className="w-full gap-x-4">
              <Input
                label="Service associé"
                state={errors.contactFullName ? "error" : "default"}
                stateRelatedMessage={errors.contactFullName?.message}
                nativeInputProps={{
                  ...register("contactFullName"),
                }}
              />
              <div className="flex flex-row gap-x-4 grow items-end">
                <Input
                  className="mb-0 w-full"
                  label="Email"
                  hintText="Privilégiez une adresse e-mail pérenne pour faciliter les échanges avec les candidats et les AAP"
                  state={errors.contactEmail ? "error" : "default"}
                  stateRelatedMessage={errors.contactEmail?.message}
                  nativeInputProps={{
                    ...register("contactEmail"),
                  }}
                />
                <Input
                  className="w-full"
                  label="Téléphone (optionnel)"
                  nativeInputProps={{
                    ...register("contactPhone"),
                  }}
                />
              </div>
            </div>
          </form>
        </div>
        <div className="flex flex-row justify-end mt-4 gap-x-4">
          <Button
            className="mr-auto"
            priority="secondary"
            linkProps={{
              href: backUrl,
            }}
          >
            Retour
          </Button>
          <Button priority="tertiary no outline" onClick={() => reset()}>
            Réinitialiser
          </Button>
          <Button
            nativeButtonProps={{
              type: "submit",
              form: "certificationAuthorityForm",
            }}
            disabled={isSubmitting}
          >
            Enregistrer
          </Button>
        </div>
      </div>
    </>
  );
};
