"use client";

import OrganismInformationForm from "../_components/OrganismInformationForm";
import { useAddAgencyPage } from "./addAgency.hook";

const AddAgencyPage = () => {
  const { createAgencyInfo } = useAddAgencyPage();
  const handleCreateAgencyInfo = async (data: any) => {
    await createAgencyInfo.mutateAsync(data);
  };
  return (
    <OrganismInformationForm
      mutationOnSubmit={handleCreateAgencyInfo}
      pathRedirection="/agencies-settings-v3"
    />
  );
};

export default AddAgencyPage;
