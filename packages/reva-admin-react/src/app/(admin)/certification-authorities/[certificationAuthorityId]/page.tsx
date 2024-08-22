"use client";
import { useCertificationAuthorityPageLogic } from "@/app/(admin)/certification-authorities/[certificationAuthorityId]/certificationAuthorityPageLogic";
import { TreeSelectItem } from "@/components/tree-select";
import { BackButton } from "@/components/back-button/BackButton";
import { successToast, graphqlErrorToast } from "@/components/toast/toast";
import {
  CertificationAuthorityForm,
  CertificationAuthorityFormData,
} from "./_components/certificationAuthorityForm/CertificationAuthorityForm";
import { useMemo } from "react";

const CertificationAuthorityPage = () => {
  const {
    certificationAuthority,
    regions,
    certifications,
    updateCertificationAuthority,
    getReferentialstatus,
    getCertificationAuthorityStatus,
  } = useCertificationAuthorityPageLogic();

  const regionItems: TreeSelectItem[] = useMemo(
    () =>
      regions.map((r) => {
        const departmentItems = r.departments.map((d) => ({
          id: d.id,
          label: d.label,
          selected: !!(certificationAuthority?.departments || []).find?.(
            (cad) => cad.id === d.id,
          ),
        }));
        return {
          id: r.id,
          label: r.label,
          selected: departmentItems.every((d) => d.selected),
          children: departmentItems,
        };
      }),
    [certificationAuthority?.departments, regions],
  );

  const certificationItems: TreeSelectItem[] = useMemo(
    () =>
      certifications
        .filter((c) => c.status === "AVAILABLE" || c.status === "INACTIVE")
        .map((c) => ({
          id: c.id,
          label: `${c.codeRncp} - ${c.label}${
            c.status === "INACTIVE" ? " (ancienne version)" : ""
          }`,
          selected: !!(certificationAuthority?.certifications || []).find?.(
            (cac) => cac.id === c.id,
          ),
        })),
    [certificationAuthority?.certifications, certifications],
  );

  const handleFormSubmit = async (data: CertificationAuthorityFormData) => {
    try {
      await updateCertificationAuthority.mutateAsync({
        certificationAuthorityId: certificationAuthority?.id || "",
        departmentIds: data.regions
          .flatMap((r) => r.children)
          .filter((d) => d.selected)
          .map((d) => d.id),
        certificationIds: data.certifications
          .filter((c) => c.selected)
          .map((c) => c.id),
      });
      successToast("modifications enregistrées");
    } catch (e) {
      graphqlErrorToast(e);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <BackButton href="/certification-authorities">
        Tous les certificateurs
      </BackButton>
      {getReferentialstatus === "success" &&
        getCertificationAuthorityStatus === "success" &&
        certificationAuthority && (
          <div className="flex flex-col">
            <h1>{certificationAuthority.label}</h1>
            <p className="text-xl mb-4">
              {certificationAuthority.contactEmail}
            </p>
            <CertificationAuthorityForm
              onSubmit={handleFormSubmit}
              regions={regionItems}
              certifications={certificationItems}
            />
          </div>
        )}
    </div>
  );
};

export default CertificationAuthorityPage;
