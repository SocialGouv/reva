"use client";

import { useAddLieuAccueilPage } from "./addLieuAccueil.hook";

import { useParams } from "next/navigation";

import OrganismInformationForm from "../_components/OrganismInformationForm";
import { OrganismInformationFormData } from "../_components/organismInformationFormSchema";

import { ConformiteNormeAccessibilite } from "@/graphql/generated/graphql";

const AddLieuAccueilPage = () => {
  const { createLieuAccueilInfo, isAdmin } = useAddLieuAccueilPage();
  const { "maison-mere-id": maisonMereAAPId } = useParams();
  const handleCreateLieuAccueilInfo = async (
    data: OrganismInformationFormData,
  ) => {
    await createLieuAccueilInfo({
      ...data,
      conformeNormesAccessibilite:
        data.conformeNormesAccessibilite as ConformiteNormeAccessibilite,
    });
  };
  return (
    <OrganismInformationForm
      mutationOnSubmit={handleCreateLieuAccueilInfo}
      pathRedirection={
        isAdmin
          ? `/maison-mere-aap/${maisonMereAAPId}`
          : `/agencies-settings-v3`
      }
    />
  );
};

export default AddLieuAccueilPage;
