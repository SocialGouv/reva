"use client";

import { ConformiteNormeAccessibilite } from "@/graphql/generated/graphql";
import OrganismInformationForm from "../_components/OrganismInformationForm";
import { OrganismInformationFormData } from "../_components/organismInformationFormSchema";
import { useAddAgencyPage } from "./addAgency.hook";

const AddAgencyPage = () => {
  const { createAgencyInfo } = useAddAgencyPage();
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
      pathRedirection="/agencies-settings-v3"
    />
  );
};

export default AddAgencyPage;
