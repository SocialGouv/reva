"use client";
import { ReactNode } from "react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { EnhancedSectionCard } from "@/components/card/enhanced-section-card/EnhancedSectionCard";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Input from "@codegouvfr/react-dsfr/Input";

import { zodResolver } from "@hookform/resolvers/zod";

import { useAddCertificationPage } from "./addCertification.hook";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";

const zodSchema = z.object({
  rncp: z.string().min(3, "obligatoire"),
});

type CompanySiretStepFormSchema = z.infer<typeof zodSchema>;

export default function CertificationDescriptionPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<CompanySiretStepFormSchema>({
    resolver: zodResolver(zodSchema),
    defaultValues: { rncp: "" },
  });

  const rncp = watch("rncp");

  const { certification } = useAddCertificationPage({ rncp });

  const handleFormSubmit = handleSubmit(async (_data) => {
    try {
      console.warn("Do something");

      successToast("La certification a bien été ajoutée");
    } catch (error) {
      graphqlErrorToast(error);
    }
  });

  return (
    <div data-test="add-fc-certification-page">
      <h1>Descriptif de la certification</h1>
      <p className="mb-12 text-xl">
        Pour faciliter l’ajout, renseignez le code RNCP pour pré-remplir le
        document avec les informations de France compétences et du Formacode.
        Ensuite, vous pourrez renseigner une structure certificatrice et (à
        minima) un gestionnaire des candidatures.
      </p>
      <div className="flex flex-col gap-8">
        <form
          id="fcCertificationForm"
          onSubmit={handleFormSubmit}
          className="my-3 flex gap-8"
        >
          <Input
            label="Code RNCP"
            nativeInputProps={{
              ...register("rncp"),
              required: true,
            }}
            className="md:w-1/4 mb-0"
          />
          {errors.rncp ? (
            <Alert
              className="hidden md:block w-full "
              title={`Certifiction non trouvée pour le code RNCP ${rncp}`}
              severity="error"
              description={errors.rncp?.message}
            />
          ) : (
            <div className="hidden md:block w-full" />
          )}
        </form>
        <EnhancedSectionCard
          data-test="fc-certification-description-card"
          title={`Informations liées au code RNCP ${certification?.NUMERO_FICHE.replace("RNCP", "") || ""}`}
          isEditable
        >
          {certification && (
            <div className="flex flex-col gap-4">
              <h3 className="mb-2">
                Descriptif de la certification avec France compétences
              </h3>
              <Info title="Intitulé">{certification.INTITULE}</Info>
              <div className="grid grid-cols-1 md:grid-cols-2">
                <Info title="Niveau">
                  {certification?.NOMENCLATURE_EUROPE.INTITULE}
                </Info>
                <Info title="Type">
                  {certification.ABREGE
                    ? `${certification.ABREGE.LIBELLE} (${certification.ABREGE.CODE})`
                    : "Inconnue"}
                </Info>
                <Info title="Date d’échéance">
                  {certification.DATE_FIN_ENREGISTREMENT
                    ? format(
                        certification.DATE_FIN_ENREGISTREMENT,
                        "dd/MM/yyyy",
                      )
                    : ""}
                </Info>
                <Info title="Date de dernière delivrance">
                  {certification.DATE_LIMITE_DELIVRANCE
                    ? format(certification.DATE_LIMITE_DELIVRANCE, "dd/MM/yyyy")
                    : ""}
                </Info>
              </div>

              <h3 className="mb-2">Domaines et sous-domaines du Formacode </h3>
            </div>
          )}
        </EnhancedSectionCard>
      </div>

      <div className="flex flex-row justify-end mt-12">
        <Button
          priority="secondary"
          linkProps={{
            href: "/certifications-v2/add-certification",
            target: "_self",
          }}
        >
          Retour
        </Button>

        <Button
          className="ml-auto"
          priority="tertiary no outline"
          onClick={() => reset()}
        >
          Réinitialiser
        </Button>
        <Button
          nativeButtonProps={{
            type: "submit",
            form: "fcCertificationForm",
          }}
          disabled={isSubmitting}
        >
          Enregistrer
        </Button>
      </div>
    </div>
  );
}

const Info = ({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) => (
  <dl className={`m-2 ${className || ""}`}>
    <dt className="mb-1">{title}</dt>
    <dd className="font-medium">{children}</dd>
  </dl>
);
