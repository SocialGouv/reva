"use client";

import { ConformiteNormeAccessibilite } from "@/graphql/generated/graphql";
import { useParams } from "next/navigation";
import OrganismInformationForm from "../_components/OrganismInformationForm";
import { OrganismInformationFormData } from "../_components/organismInformationFormSchema";
import { useAddAgencyPage } from "./addAgency.hook";

const AddAgencyPage = () => {
  const { createAgencyInfo, isAdmin } = useAddAgencyPage();
  const { "maison-mere-id": maisonMereAAPId } = useParams();
  const handleCreateAgencyInfo = async (data: OrganismInformationFormData) => {
    await createAgencyInfo({
      ...data,
      conformeNormesAccessibilite:
        data.conformeNormesAccessibilite as ConformiteNormeAccessibilite,
    });
  };
  return (
    <OrganismInformationForm
      mutationOnSubmit={handleCreateAgencyInfo}
      pathRedirection={
        isAdmin
          ? `/maison-mere-aap/${maisonMereAAPId}`
          : `/agencies-settings-v3`
      }
    />
  );
};

export default AddAgencyPage;
