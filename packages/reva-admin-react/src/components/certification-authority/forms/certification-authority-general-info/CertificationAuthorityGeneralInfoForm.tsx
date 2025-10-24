import Button from "@codegouvfr/react-dsfr/Button";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import Input from "@codegouvfr/react-dsfr/Input";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useAuth } from "@/components/auth/auth";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import {
  sanitizedEmail,
  sanitizedOptionalPhone,
  sanitizedText,
} from "@/utils/input-sanitization";

import { useCertificationAuthorityForm } from "./certificationAuthorityGeneralInfoForm.hooks";

type FormData = z.infer<typeof schema>;

const schema = z.object({
  accountFirstname: sanitizedText(),
  accountLastname: sanitizedText(),
  accountEmail: sanitizedEmail(),
  contactFullName: sanitizedText(),
  contactEmail: sanitizedEmail(),
  contactPhone: sanitizedOptionalPhone(),
  isGlobalContact: z.boolean(),
});

const globalContactConfirmationModal = createModal({
  id: "global-contact-confirmation-modal",
  isOpenedByDefault: false,
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
  const router = useRouter();

  const { isAdmin } = useAuth();

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    getValues,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      accountFirstname: certificationAuthority.account?.firstname || "",
      accountLastname: certificationAuthority.account?.lastname || "",
      accountEmail: certificationAuthority.account?.email || "",
      contactFullName: certificationAuthority.contactFullName || undefined,
      contactEmail: certificationAuthority.contactEmail || undefined,
      contactPhone: certificationAuthority.contactPhone || undefined,
      isGlobalContact: false,
    },
  });

  const handleFormSubmit = handleSubmit(
    async (data) => {
      try {
        await updateCertificationAuthority.mutateAsync({
          certificationAuthorityId: certificationAuthority.id,
          certificationAuthorityData: data,
        });

        successToast("L'autorité de certification a bien été mise à jour");
        router.push(backUrl);
      } catch (error) {
        graphqlErrorToast(error);
      }
    },
    (e) => console.error(e),
  );

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { isGlobalContact } = getValues();
    if (isGlobalContact) {
      return globalContactConfirmationModal.open();
    } else {
      await handleFormSubmit(e);
    }
  };

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
              data-test="certification-authority-label"
            />
            <div className="flex gap-4">
              <Input
                className="w-full"
                label="Nom"
                nativeInputProps={{
                  ...register("accountLastname"),
                }}
                disabled={!isAdmin}
                data-test="certification-authority-account-lastname"
                state={errors.accountLastname ? "error" : "default"}
                stateRelatedMessage={errors.accountLastname?.message}
              />
              <Input
                className="w-full"
                label="Prénom (optionnel)"
                nativeInputProps={{
                  ...register("accountFirstname"),
                }}
                disabled={!isAdmin}
                data-test="certification-authority-account-firstname"
                state={errors.accountFirstname ? "error" : "default"}
                stateRelatedMessage={errors.accountFirstname?.message}
              />
            </div>
            <Input
              label="Adresse électronique de connexion"
              nativeInputProps={{
                ...register("accountEmail"),
              }}
              disabled={!isAdmin}
              className="w-[calc(50%-0.5rem)]"
              data-test="certification-authority-account-email"
              state={errors.accountEmail ? "error" : "default"}
              stateRelatedMessage={errors.accountEmail?.message}
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
          <form onSubmit={onSubmit} id="certificationAuthorityForm">
            <div className="w-full flex flex-col gap-y-4">
              <Input
                label="Service associé"
                className="mb-0"
                state={errors.contactFullName ? "error" : "default"}
                stateRelatedMessage={errors.contactFullName?.message}
                nativeInputProps={{
                  ...register("contactFullName"),
                }}
                data-test="certification-authority-contact-full-name"
              />
              <div className="flex flex-col md:flex-row gap-4 grow items-end">
                <Input
                  className="mb-0 w-full"
                  label="Adresse électronique"
                  hintText="Privilégiez une adresse électronique pérenne pour faciliter les échanges avec les candidats et les AAP"
                  state={errors.contactEmail ? "error" : "default"}
                  stateRelatedMessage={errors.contactEmail?.message}
                  nativeInputProps={{
                    ...register("contactEmail"),
                  }}
                  data-test="certification-authority-contact-email"
                />
                <Input
                  className="w-full"
                  label="Téléphone (optionnel)"
                  nativeInputProps={{
                    ...register("contactPhone"),
                  }}
                  data-test="certification-authority-contact-phone"
                />
              </div>
              <Checkbox
                small
                options={[
                  {
                    label:
                      "J’attribue ce contact référent à tous les comptes locaux de ce gestionnaire de candidatures",
                    hintText:
                      "Ce contact référent sera le seul affiché aux AAP et aux candidats sur votre zone d’intervention et les certifications gérées",
                    nativeInputProps: { ...register("isGlobalContact") },
                  },
                ]}
              />
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
            disabled={isSubmitting || !isDirty}
            data-test="certification-authority-submit-button"
          >
            Enregistrer
          </Button>
        </div>
      </div>
      <globalContactConfirmationModal.Component
        title="Attribuer le contact référent"
        buttons={[
          {
            children: "Annuler",
          },
          {
            onClick: handleFormSubmit,
            children: "Confirmer l'attribution",
          },
        ]}
      >
        <p>
          Vous êtes sur le point d’attribuer le contact référent de votre
          gestionnaire de candidatures à tous les comptes locaux rattachés. Ce
          contact sera visible par les AAP et les candidats tout au long de leur
          parcours de VAE.
        </p>
        <p>
          Voulez-vous confirmer l’attribution de ce contact référent à tous les
          comptes ?
        </p>
      </globalContactConfirmationModal.Component>
    </>
  );
};
