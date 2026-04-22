"use client";

import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";

import { successToast, graphqlErrorToast } from "@/components/toast/toast";

import {
  CertificationStructureFormData,
  StructureForm,
} from "./_components/StructureForm";
import { useUpdateCertificationStructurePage } from "./updateCertificationStructure.hook";

export default function UpdateCertificationStructurePage() {
  const { certificationId } = useParams<{
    certificationId: string;
  }>();

  const router = useRouter();

  const {
    certification,
    availableStructures,
    getCertificationStructureAndGestionnairesQueryStatus,
    updateCertificationStructure,
  } = useUpdateCertificationStructurePage({ certificationId });

  const handleFormSubmit = async (data: CertificationStructureFormData) => {
    try {
      await updateCertificationStructure.mutateAsync({
        ...data,
        certificationAuthorityIds: data.certificationAuthorities
          .filter(({ checked }) => checked)
          .map(({ id }) => id),
      });
      successToast("modifications enregistrées");
      router.push(`/certifications/${certificationId}`);
    } catch (e) {
      graphqlErrorToast(e);
    }
  };

  return getCertificationStructureAndGestionnairesQueryStatus === "success" &&
    certification ? (
    <StructureForm
      certification={certification}
      availableStructures={availableStructures}
      onSubmit={handleFormSubmit}
    />
  ) : null;
}
