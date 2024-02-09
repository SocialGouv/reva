"use client";
import { useCertificationQueries } from "@/app/(admin)/certifications/[certificationId]/certificationQueries";
import { Certification } from "@/graphql/generated/graphql";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Select } from "@codegouvfr/react-dsfr/Select";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useParams } from "next/navigation";
import { useController, useForm } from "react-hook-form";
import { z } from "zod";
import { PageTitle } from "@/components/page/page-title/PageTitle";
import Link from "next/link";
import { useEffect } from "react";

const schema = z.object({
  codeRncp: z.string(),
  label: z.string(),
  expiresAt: z.string(),
  availableAt: z.string(),
  typeDiplomeId: z.string(),
  degreeId: z.string(),
  conventionCollectiveId: z.string(),
  domaineId: z.string(),
  certificationAuthorityTag: z.string(),
});

type FormData = z.infer<typeof schema>;

const certificationToFormData = (
  c: Partial<Certification>,
): FormData | undefined =>
  c
    ? {
        codeRncp: c.codeRncp || "",
        label: c.label || "",
        expiresAt: format(new Date(c.expiresAt || ""), "yyyy-MM-dd"),
        availableAt: format(new Date(c.availableAt || ""), "yyyy-MM-dd"),
        typeDiplomeId: c.typeDiplome?.id || "",
        certificationAuthorityTag: c.certificationAuthorityTag || "",
        degreeId: c.degree?.id || "",
        conventionCollectiveId: c.conventionsCollectives?.[0]?.id || "",
        domaineId: c.domaines?.[0]?.id || "",
      }
    : undefined;

const UpdateCertificationPage = () => {
  const { certificationId } = useParams<{ certificationId: string }>();
  const {
    certification,
    typeDiplomes,
    degrees,
    domaines,
    conventionCollectives,
  } = useCertificationQueries({
    certificationId,
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: certificationToFormData(certification as Certification),
  });

  useEffect(() => {
    certification &&
      reset(certificationToFormData(certification as Certification));
  }, [certification, reset]);

  const handleFormSubmit = handleSubmit((data) => {
    console.log({ data });
  });

  const typeDiplomeController = useController({
    control,
    name: "typeDiplomeId",
  });

  const degreeController = useController({
    control,
    name: "degreeId",
  });

  const domaineController = useController({
    control,
    name: "domaineId",
  });

  const conventionCollectiveController = useController({
    control,
    name: "conventionCollectiveId",
  });

  return (
    <div className="flex flex-col w-full">
      {certification && (
        <>
          <Link
            href={`/certifications/${certificationId}`}
            className="fr-icon-arrow-left-line fr-link--icon-left text-blue-900 text-lg mr-auto mb-8"
          >
            Retour
          </Link>
          <PageTitle> Modifier une certification</PageTitle>
          <p>
            Sauf mention contraire “(optionnel)” dans le label, tous les champs
            sont obligatoires.
          </p>
          <br />
          <form
            className="grid grid-cols-1  md:grid-cols-2 gap-8"
            onSubmit={handleFormSubmit}
            onReset={(e) => {
              e.preventDefault();
              reset(certificationToFormData(certification as Certification));
            }}
          >
            <Input
              label="Libellé"
              className="md:col-span-2"
              nativeInputProps={{ ...register("label") }}
              state={errors.label ? "error" : "default"}
              stateRelatedMessage={errors.label?.message}
            />
            <Input
              label="Code RNCP"
              nativeInputProps={{ ...register("codeRncp") }}
              state={errors.codeRncp ? "error" : "default"}
              stateRelatedMessage={errors.codeRncp?.message}
            />
            <Input
              label="Tag certificateur"
              nativeInputProps={{
                ...register("certificationAuthorityTag"),
              }}
              state={errors.certificationAuthorityTag ? "error" : "default"}
              stateRelatedMessage={errors.certificationAuthorityTag?.message}
            />
            <Input
              className="col-start-1"
              label="Disponible à partir du"
              nativeInputProps={{
                ...register("availableAt"),
                type: "date",
              }}
              state={errors.availableAt ? "error" : "default"}
              stateRelatedMessage={errors.availableAt?.message}
            />
            <Input
              label="Expire à partir du"
              nativeInputProps={{
                ...register("expiresAt"),
                type: "date",
              }}
              state={errors.expiresAt ? "error" : "default"}
              stateRelatedMessage={errors.expiresAt?.message}
            />
            <Select
              label="Niveau de la certification"
              nativeSelectProps={{
                onChange: (event) =>
                  degreeController.field.onChange(event.target.value),
                value: degreeController.field.value,
              }}
            >
              {degrees?.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.longLabel}
                </option>
              ))}
            </Select>
            <Select
              label="Type de la certification"
              nativeSelectProps={{
                onChange: (event) =>
                  typeDiplomeController.field.onChange(event.target.value),
                value: typeDiplomeController.field.value,
              }}
            >
              {typeDiplomes?.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </Select>
            <Select
              label="Domaine de la certification"
              nativeSelectProps={{
                onChange: (event) =>
                  domaineController.field.onChange(event.target.value),
                value: domaineController.field.value,
              }}
            >
              <option />
              {domaines?.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </Select>
            <Select
              label="Convention collective de la certification"
              nativeSelectProps={{
                onChange: (event) =>
                  conventionCollectiveController.field.onChange(
                    event.target.value,
                  ),
                value: conventionCollectiveController.field.value,
              }}
            >
              <option />
              {conventionCollectives?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </Select>
            <div className="flex flex-col md:flex-row gap-4 items-center md:col-start-2 md:ml-auto md:mt-8">
              <Button priority="secondary" type="reset">
                Annuler les modifications
              </Button>
              <Button disabled={isSubmitting}>Valider les modifications</Button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default UpdateCertificationPage;
