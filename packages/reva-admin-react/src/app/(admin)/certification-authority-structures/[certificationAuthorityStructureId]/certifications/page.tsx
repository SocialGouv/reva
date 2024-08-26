"use client";

import { useParams } from "next/navigation";
import {
  useCertificationsForm,
  useCertificationsPage,
} from "./certifications.hooks";
import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { CertificationAuthorityStructureBreadcrumb } from "../_components/certification-authority-structure-breadcrumb/CertificationAuthorityStructureBreadcrumb";
import { TreeSelect } from "@/components/tree-select";

const CertificationAuthorityStructureCertificationsPage = () => {
  const { certificationAuthorityStructureId } = useParams<{
    certificationAuthorityStructureId: string;
  }>();

  const {
    certificationAuthorityStructure,
    certifications,
    updateCertificationAuthorityStructureCertifications,
  } = useCertificationsPage({ certificationAuthorityStructureId });

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
        await updateCertificationAuthorityStructureCertifications.mutateAsync({
          certificationAuthorityStructureId,
          certificationIds: data.certifications
            .filter((c) => c.selected)
            .map((c) => c.id),
        });
        successToast("modifications enregistrées");
      } catch (e) {
        graphqlErrorToast(e);
      }
    },
    (e) => console.log({ e }),
  );

  if (!certificationAuthorityStructure) {
    return null;
  }

  return (
    <div className="flex flex-col flex-1">
      {certificationAuthorityStructure && (
        <div className="flex flex-col">
          <CertificationAuthorityStructureBreadcrumb
            certificationAuthorityStructureId={
              certificationAuthorityStructureId
            }
            certificationAuthorityStructureLabel={
              certificationAuthorityStructure.label
            }
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
              backUrl={`/certification-authority-structures/${certificationAuthorityStructureId}`}
              formState={{ isDirty, isSubmitting }}
            />
          </form>
        </div>
      )}
    </div>
  );
};

export default CertificationAuthorityStructureCertificationsPage;
