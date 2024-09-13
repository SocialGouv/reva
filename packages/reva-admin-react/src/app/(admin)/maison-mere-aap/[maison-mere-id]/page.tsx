"use client";
import { HeadAgencySettingsSummary } from "@/app/(aap)/agencies-settings-v3/_components/agencies-settings-summary/HeadAgencySettingsSummary";
import { successToast } from "@/components/toast/toast";
import { MaisonMereAap, Organism } from "@/graphql/generated/graphql";
import ToggleSwitch from "@codegouvfr/react-dsfr/ToggleSwitch";
import { useParams } from "next/navigation";
import { useMaisonMereAAP } from "./_components/maisonMereAAP.hook";

const MaisonMereAapPage = () => {
  const { "maison-mere-id": maisonMereAAPId }: { "maison-mere-id": string } =
    useParams();
  const {
    maisonMereAAP,
    headAgencyOrganism,
    accountId,
    updateOrganismIsActive,
  } = useMaisonMereAAP(maisonMereAAPId);

  if (!maisonMereAAP || !maisonMereAAP.organisms) return null;
  const organisms = maisonMereAAP.organisms;
  const maisonMereIsActive = !!organisms.find((organism) => organism.isActive);

  const handleIsActiveChange = async (isActive: boolean) => {
    await updateOrganismIsActive({
      maisonMereAAPId,
      isActive,
    });
    successToast(
      isActive
        ? "La maison mère a été activée avec succès"
        : "La maison mère a été désactivée avec succès",
    );
  };

  return (
    <>
      <h1>{maisonMereAAP.raisonSociale}</h1>
      <div className="flex items-center justify-between w-full border-y-[1px] border-y-neutral-200 py-2 my-4">
        <span>Statut de la structure</span>
        <ToggleSwitch
          label=""
          defaultChecked={maisonMereIsActive}
          inputTitle="Activer toutes les agences de la maison mère"
          onChange={(checked) => handleIsActiveChange(checked)}
        />
      </div>
      <HeadAgencySettingsSummary
        accountId={accountId}
        organism={headAgencyOrganism as Organism}
        maisonMereAAP={maisonMereAAP as MaisonMereAap}
      />
    </>
  );
};

export default MaisonMereAapPage;
