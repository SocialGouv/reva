"use client";
import { Impersonate } from "@/components/impersonate";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CertificationAuthorityStructureBreadcrumb } from "../../_components/certification-authority-structure-breadcrumb/CertificationAuthorityStructureBreadcrumb";
import { CertificationsSummaryCard } from "../../../../../../components/certification-authority/summary-cards/certifications-summary-card/CertificationsSummaryCard";
import InterventionAreaSummaryCard from "../../../../../../components/certification-authority/summary-cards/intervention-area-summary-card/InterventionAreaSummaryCard";
import AccountsSummaryCard from "./_components/accounts-summary-card/AccountsSummaryCard";
import {
  useCertificationAuthority,
  useCertificationAuthorityForm,
} from "./certificationAuthority.hooks";
import { useParams } from "next/navigation";
import GeneralInformationCard from "@/components/certification-authority/summary-cards/general-information-card/GeneralInformationCard";
import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";
import { CertificationAuthorityLocalAccountsSummaryCard } from "@/components/certification-authority/summary-cards/certification-authority-local-accounts-summary-card/CertificationAuthorityLocalAccountsSummaryCard";

type FormData = z.infer<typeof schema>;

const schema = z.object({
  label: z.string().default(""),
  contactFullName: z.string().optional().default(""),
  contactEmail: z
    .string()
    .email("Le champ doit contenir une adresse email valide")
    .optional()
    .default(""),
});

const CertificationAuthorityAdminComponent = ({
  certificationAuthority,
  certificationAuthorityStructureId,
}: {
  certificationAuthority: NonNullable<
    ReturnType<typeof useCertificationAuthority>["certificationAuthority"]
  >;
  certificationAuthorityStructureId: string;
}) => {
  const { updateCertificationAuthority } = useCertificationAuthorityForm();
  const { isFeatureActive } = useFeatureflipping();

  const {
    register,
    reset,
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

  const regionsAndDepartments: {
    id: string;
    label: string;
    departments: { id: string; label: string; code: string }[];
  }[] = [];
  certificationAuthority?.departments.forEach((department) => {
    if (department.region) {
      let region = regionsAndDepartments.find(
        (r) => r.id === department.region?.id,
      );
      if (!region) {
        region = {
          id: department.region.id,
          label: department.region.label,
          departments: [],
        };
        regionsAndDepartments.push(region);
      }
      region.departments.push(department);
    }
  });

  return (
    <div className="flex flex-col flex-1">
      <CertificationAuthorityStructureBreadcrumb
        certificationAuthorityStructureId={certificationAuthorityStructureId}
        certificationAuthorityStructureLabel={
          certificationAuthority.certificationAuthorityStructures.find(
            (s) => s.id === certificationAuthorityStructureId,
          )?.label || "inconnu"
        }
        pageLabel={certificationAuthority.label}
      />
      <div className="flex justify-between gap-4 w-full">
        <h1 className="flex-1">{certificationAuthority.label}</h1>

        <Impersonate accountId={certificationAuthority?.account?.id} />

        <div>
          <Button
            priority="secondary"
            linkProps={{
              href: `/candidacies/feasibilities/?CATEGORY=ALL&page=1&certificationAuthorityId=${certificationAuthority.id}`,
              target: "_blank",
            }}
          >
            Voir les candidatures
          </Button>
        </div>
      </div>

      <p className="text-xl">
        Il s’occupe des candidatures (dossier de validation, jury...) et peut
        ajouter des comptes collaborateurs. L’ajout d’un certificateur
        administrateur est obligatoire pour la gestion des candidatures.
      </p>
      <div className="flex flex-col gap-y-6">
        {isFeatureActive("PARAMETRES_CERTIFICATEUR") ? (
          <GeneralInformationCard
            hrefPrefix={`/certification-authority-structures/${certificationAuthority.certificationAuthorityStructures[0].id}/certificateurs-administrateurs/${certificationAuthority.id}`}
            certificationAuthority={certificationAuthority}
          />
        ) : (
          <form onSubmit={handleFormSubmit} id="certificationAuthorityForm">
            <div className="grid grid-cols-2 w-full gap-x-4">
              <Input
                label="Gestionnaire des candidatures"
                className="col-span-2"
                nativeInputProps={{
                  ...register("label"),
                }}
              />
              <Input
                label="Nom et prénom ou Service"
                nativeInputProps={{
                  ...register("contactFullName"),
                }}
              />
              <Input
                label="Email de connexion"
                state={errors.contactEmail ? "error" : "default"}
                stateRelatedMessage={errors.contactEmail?.message}
                nativeInputProps={{
                  ...register("contactEmail"),
                }}
              />
            </div>
          </form>
        )}

        <InterventionAreaSummaryCard
          regions={regionsAndDepartments}
          updateButtonHref={`/certification-authority-structures/${certificationAuthorityStructureId}/certificateurs-administrateurs/${certificationAuthority.id}/zone-intervention`}
        />
        <CertificationsSummaryCard
          certifications={certificationAuthority.certifications}
          updateButtonHref={`/certification-authority-structures/${certificationAuthorityStructureId}/certificateurs-administrateurs/${certificationAuthority.id}/certifications`}
        />
        {isFeatureActive("PARAMETRES_CERTIFICATEUR") ? (
          <CertificationAuthorityLocalAccountsSummaryCard
            accounts={
              certificationAuthority.certificationAuthorityLocalAccounts
            }
            addLocalAccountPageUrl={`/certification-authority-structures/${certificationAuthorityStructureId}/certificateurs-administrateurs/${certificationAuthority.id}/comptes-collaborateurs/ajouter`}
            updateLocalAccountPageUrl={`/certification-authority-structures/${certificationAuthorityStructureId}/certificateurs-administrateurs/${certificationAuthority.id}/comptes-collaborateurs/`}
          />
        ) : (
          <AccountsSummaryCard
            accounts={
              certificationAuthority.certificationAuthorityLocalAccounts
            }
            hrefPrefix={`/certification-authority-structures/${certificationAuthorityStructureId}/certificateurs-administrateurs/${certificationAuthority.id}/comptes-collaborateurs`}
          />
        )}
      </div>
      <div className="flex flex-row justify-end mt-4 gap-x-4">
        <Button
          className="mr-auto"
          priority="secondary"
          linkProps={{
            href: `/certification-authority-structures/${certificationAuthorityStructureId}`,
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
  );
};

const CertificationAuthorityAdminPage = () => {
  const { certificationAuthority, getCertificationAuthorityStatus } =
    useCertificationAuthority();

  const { certificationAuthorityStructureId } = useParams<{
    certificationAuthorityStructureId: string;
  }>();

  if (
    !certificationAuthority ||
    getCertificationAuthorityStatus !== "success"
  ) {
    return null;
  }

  return (
    <CertificationAuthorityAdminComponent
      certificationAuthority={certificationAuthority}
      certificationAuthorityStructureId={certificationAuthorityStructureId}
    />
  );
};

export default CertificationAuthorityAdminPage;
