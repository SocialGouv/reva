import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { FormButtons } from "@/components/form/form-footer/FormButtons";
import Breadcrumb from "@codegouvfr/react-dsfr/Breadcrumb";
import Select from "@codegouvfr/react-dsfr/Select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

type CertificationForForm = {
  id: string;
  label: string;
  certificationAuthorityStructure?: { id: string; label: string } | null;
};

type StructureForForm = { id: string; label: string };

const certificationStructureFormSchema = z.object({
  certificationAuthorityStructureId: z
    .string()
    .min(1, "Merci de remplir ce champ")
    .default(""),
});

export type CertificationStructureFormData = z.infer<
  typeof certificationStructureFormSchema
>;

export const StructureForm = ({
  certification,
  availableStructures,
  onSubmit,
}: {
  certification: CertificationForForm;
  availableStructures: StructureForForm[];
  onSubmit(data: CertificationStructureFormData): Promise<void>;
}) => {
  const {
    register,
    handleSubmit,
    formState: { isDirty, isSubmitting },
  } = useForm<CertificationStructureFormData>({
    resolver: zodResolver(certificationStructureFormSchema),
    defaultValues: {
      certificationAuthorityStructureId:
        certification.certificationAuthorityStructure?.id,
    },
  });

  const handleFormSubmit = handleSubmit(onSubmit);

  return (
    <div data-test="update-certification-structure-page">
      <Breadcrumb
        currentPageLabel="Structure certificatrice et gestionnaires"
        homeLinkProps={{
          href: `/`,
        }}
        segments={[
          {
            label: certification.label,
            linkProps: {
              href: `/certifications-v2/${certification.id}`,
            },
          },
        ]}
      />

      <h1>Structure certificatrice et gestionnaires</h1>
      <FormOptionalFieldsDisclaimer />
      <p className="mb-12 text-xl">
        Pour terminer l’ajout de cette certification, vous devez la relier à une
        structure certificatrice et (à minima) à un gestionnaire des
        candidatures. Il est également possible de la relier au gestionnaire des
        candidatures d’une autre structure.
      </p>
      <form onSubmit={handleFormSubmit}>
        <Select
          data-test="certification-authority-structure-select"
          label="Structure certificatrice"
          hint="La structure certificatrice (organismes et ministères) est l’entité morale à l’origine de l’enregistrement de cette certification au RNCP."
          nativeSelectProps={{
            ...register("certificationAuthorityStructureId"),
          }}
        >
          {availableStructures.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </Select>
        <FormButtons
          backUrl={`/certifications-v2/${certification.id}`}
          formState={{
            isDirty,
            isSubmitting,
          }}
        />
      </form>
    </div>
  );
};
