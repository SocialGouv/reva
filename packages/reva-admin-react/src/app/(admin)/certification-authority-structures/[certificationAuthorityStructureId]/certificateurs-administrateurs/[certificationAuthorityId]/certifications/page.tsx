"use client";

import { useParams } from "next/navigation";
import {
  useCertificationsForm,
  useCertificationsPage,
} from "./certifications.hooks";
import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { CertificationAuthorityStructureBreadcrumb } from "../../../_components/certification-authority-structure-breadcrumb/CertificationAuthorityStructureBreadcrumb";
import { TreeSelect } from "@/components/tree-select";

const CertificationAuthorityCertificationsPage = () => {
  const { certificationAuthorityStructureId, certificationAuthorityId } =
    useParams<{
      certificationAuthorityStructureId: string;
      certificationAuthorityId: string;
    }>();

  const {
    certificationAuthority,
    certifications,
    updateCertificationAuthorityCertifications,
  } = useCertificationsPage({ certificationAuthorityId });

  const {
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting },
    certificationsController,
    toggleCertification,
    toggleAllCertifications,
  } = useCertificationsForm({ certifications });

  const handleFormSubmit = handleSubmit(
    async (data) => {
      try {
        await updateCertificationAuthorityCertifications.mutateAsync({
          certificationAuthorityId,
          certificationIds: data.certifications
            .filter((c) => c.selected)
            .map((c) => c.id),
        });
        successToast("Modifications enregistrées");
      } catch (e) {
        graphqlErrorToast(e);
      }
    },
    (e) => console.log({ e }),
  );

  if (!certificationAuthority) {
    return null;
  }

  return (
    <div className="flex flex-col flex-1">
      {certificationAuthority && (
        <div className="flex flex-col">
          <CertificationAuthorityStructureBreadcrumb
            certificationAuthorityStructureId={
              certificationAuthorityStructureId
            }
            certificationAuthorityStructureLabel={
              certificationAuthority.certificationAuthorityStructure.label
            }
            certificationAuthorityId={certificationAuthorityId}
            certificationAuthoritylabel={certificationAuthority.label}
            pageLabel={"Certifications gérées"}
          />
          <h1>Certifications gérées</h1>
          <p className="text-xl">
            Cochez les certifications proposées par la structure certificatrice.
            Vous pouvez choisir une ou plusieurs certifications.
          </p>
          <form
            className="flex flex-col mt-4"
            onSubmit={handleFormSubmit}
            onReset={(e) => {
              e.preventDefault();
              reset();
            }}
          >
            <div className="flex flex-col">
              <TreeSelect
                title=""
                label="Toutes les certifications"
                fullWidth
                items={certificationsController.field.value || []}
                onClickSelectAll={(selected) =>
                  toggleAllCertifications(selected)
                }
                onClickItem={(i) => toggleCertification(i.id)}
              />
            </div>
            <FormButtons
              backUrl={`/certification-authority-structures/${certificationAuthorityStructureId}/certificateurs-administrateurs/${certificationAuthorityId}/`}
              formState={{ isDirty, isSubmitting }}
            />
          </form>
        </div>
      )}
    </div>
  );
};

export default CertificationAuthorityCertificationsPage;
