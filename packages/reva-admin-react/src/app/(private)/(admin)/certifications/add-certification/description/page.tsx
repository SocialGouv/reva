"use client";

import { Button } from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import Tag from "@codegouvfr/react-dsfr/Tag";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { EnhancedSectionCard } from "@/components/card/enhanced-section-card/EnhancedSectionCard";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { sanitizedText } from "@/utils/input-sanitization";

import { useAddCertificationPage } from "./addCertification.hook";

const zodSchema = z.object({
  rncp: sanitizedText(),
});

type CompanySiretStepFormSchema = z.infer<typeof zodSchema>;

export default function CertificationDescriptionPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
    watch,
  } = useForm<CompanySiretStepFormSchema>({
    resolver: zodResolver(zodSchema),
    defaultValues: { rncp: "" },
  });

  const rncp = watch("rncp");

  const { certification, addCertification } = useAddCertificationPage({ rncp });

  const handleFormSubmit = handleSubmit(async (_data) => {
    try {
      const {
        referential_addCertification: { id: newCertificationId },
      } = await addCertification.mutateAsync({
        codeRncp: rncp,
      });

      successToast("Modification enregistrée");

      router.push(`/certifications/${newCertificationId}`);
    } catch (error) {
      graphqlErrorToast(error);
    }
  });

  return (
    <div data-testid="add-fc-certification-page">
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
          className="flex gap-8"
        >
          <Input
            data-testid="fc-certification-description-input"
            label="Code RNCP"
            nativeInputProps={{
              ...register("rncp"),
              required: true,
            }}
            className="md:w-1/4 mb-0"
            state={errors.rncp ? "error" : "default"}
            stateRelatedMessage={errors.rncp?.message}
          />
        </form>
        <EnhancedSectionCard
          data-testid="fc-certification-description-card"
          title={`Informations liées au code RNCP ${certification?.NUMERO_FICHE.replace("RNCP", "") || ""}`}
          isEditable
        >
          {certification && (
            <div className="flex flex-col gap-6">
              <h3
                data-testid="fc-certification-description-card-title"
                className="mb-0"
              >
                Descriptif de la certification avec France compétences
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Info className="col-span-1 md:col-span-2" title="Intitulé">
                  {certification.INTITULE}
                </Info>

                <Info title="Niveau">
                  {certification?.NOMENCLATURE_EUROPE?.INTITULE || "Inconnu"}
                </Info>
                <Info title="Type">
                  {certification.ABREGE
                    ? `${certification.ABREGE.LIBELLE} (${certification.ABREGE.CODE})`
                    : "Inconnu"}
                </Info>
                <Info title="Date d’échéance">
                  {certification.DATE_FIN_ENREGISTREMENT
                    ? format(
                        certification.DATE_FIN_ENREGISTREMENT,
                        "dd/MM/yyyy",
                      )
                    : "Inconnue"}
                </Info>
                <Info title="Date de dernière delivrance">
                  {certification.DATE_LIMITE_DELIVRANCE
                    ? format(certification.DATE_LIMITE_DELIVRANCE, "dd/MM/yyyy")
                    : "Inconnue"}
                </Info>
              </div>

              <h3 className="mb-0">Domaines et sous-domaines du Formacode </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {certification.DOMAINS.length == 0 && (
                  <div>Aucun formacode associé</div>
                )}
                {certification.DOMAINS.map((domain) => (
                  <div key={domain.id} className="flex flex-col gap-2">
                    <div>{domain.label}</div>
                    <div
                      key={domain.id}
                      className="flex flex-row flex-wrap gap-2"
                    >
                      {domain.children.map((subDomain) => (
                        <Tag key={subDomain.id}>
                          {`${subDomain.code} ${subDomain.label}`}
                        </Tag>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </EnhancedSectionCard>
      </div>

      <div className="flex flex-row justify-end mt-12 gap-2">
        <Button
          priority="secondary"
          linkProps={{
            href: "/certifications/add-certification",
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
  <dl className={`${className || ""}`}>
    <dt className="mb-1">{title}</dt>
    <dd className="font-medium">{children}</dd>
  </dl>
);
