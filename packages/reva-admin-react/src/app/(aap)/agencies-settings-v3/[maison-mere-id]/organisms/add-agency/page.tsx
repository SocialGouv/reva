"use client";

import { useParams } from "next/navigation";

import { ConformiteNormeAccessibilite } from "@/graphql/generated/graphql";

import OrganismInformationForm from "../_components/OrganismInformationForm";
import { OrganismInformationOutputData } from "../_components/organismInformationFormSchema";

import { useAddLieuAccueilPage } from "./addLieuAccueil.hook";

const AddLieuAccueilPage = () => {
  const { createLieuAccueilInfo, isAdmin } = useAddLieuAccueilPage();
  const { "maison-mere-id": maisonMereAAPId } = useParams();
  const handleCreateLieuAccueilInfo = async (
    data: OrganismInformationOutputData,
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
