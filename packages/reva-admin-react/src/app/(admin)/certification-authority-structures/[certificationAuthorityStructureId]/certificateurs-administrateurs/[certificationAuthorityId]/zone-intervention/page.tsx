"use client";
import {
  useCertificationAuthority,
  useInterventionAreaFormLogic,
} from "./zone-intervention.hook";
import { TreeSelect } from "@/components/tree-select";
import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { useParams } from "next/navigation";
import { CertificationAuthorityStructureBreadcrumb } from "../../../_components/certification-authority-structure-breadcrumb/CertificationAuthorityStructureBreadcrumb";

const CertificationAuthorityComponent = ({
  certificationAuthority,
  regions,
}: {
  certificationAuthority: NonNullable<
    ReturnType<typeof useCertificationAuthority>["certificationAuthority"]
  >;
  regions: NonNullable<ReturnType<typeof useCertificationAuthority>["regions"]>;
}) => {
  const {
    regionsAndDeparmController,
    handleFormSubmit,
    toggleRegionOrDepartment,
    toggleAllRegionsAndDepartments,
    isSubmitting,
    isDirty,
  } = useInterventionAreaFormLogic({
    certificationAuthority,
    regions,
  });

  const { certificationAuthorityStructureId, certificationAuthorityId } =
    useParams<{
      certificationAuthorityStructureId: string;
      certificationAuthorityId: string;
    }>();

  return (
    <div className="flex flex-col flex-1">
      <CertificationAuthorityStructureBreadcrumb
        certificationAuthorityStructureId={certificationAuthorityStructureId}
        certificationAuthorityStructureLabel={
          certificationAuthority.certificationAuthorityStructure.label
        }
        certificationAuthorityId={certificationAuthorityId}
        certificationAuthoritylabel={certificationAuthority.label}
        pageLabel={"Zone d'intervention"}
      />
      <form onSubmit={handleFormSubmit} className="flex flex-col w-full">
        <fieldset className="grid gap-x-8">
          <div className="flex flex-col gap-y-4 sm:gap-x-8">
            <legend className="text-2xl font-bold">Zone d'intervention</legend>

            <TreeSelect
              title="Cochez les régions ou départements gérés"
              label="Toute la France"
              fullWidth
              fullHeight
              items={regionsAndDeparmController.field.value || []}
              onClickSelectAll={(selected) =>
                toggleAllRegionsAndDepartments(selected)
              }
              onClickItem={(i) => toggleRegionOrDepartment(i.id)}
            />
          </div>
        </fieldset>
        <FormButtons
          formState={{ isDirty, isSubmitting }}
          backUrl={`/certification-authority-structures/${certificationAuthorityStructureId}/certificateurs-administrateurs/${certificationAuthorityId}`}
        />
      </form>
    </div>
  );
};

const CertificationAuthorityPage = () => {
  const { certificationAuthority, regions } = useCertificationAuthority();

  if (!certificationAuthority || regions.length === 0) {
    return null;
  }

  return (
    <CertificationAuthorityComponent
      certificationAuthority={certificationAuthority}
      regions={regions}
    />
  );
};

export default CertificationAuthorityPage;
