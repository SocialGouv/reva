"use client";
import { HeadAgencySettingsSummary } from "@/app/(aap)/agencies-settings-v3/_components/agencies-settings-summary/HeadAgencySettingsSummary";
import { Impersonate } from "@/components/impersonate";
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
    updateMaisonMereIsSignalized,
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

  const handleIsSignalizedChange = async (isSignalized: boolean) => {
    await updateMaisonMereIsSignalized({
      maisonMereAAPId,
      isSignalized,
    });
    successToast(
      isSignalized
        ? "La maison mère a été signalée avec succès"
        : "La maison mère n'est plus signalée",
    );
  };

  return (
    <>
      <div className="flex justify-between w-full">
        <h1>{maisonMereAAP.raisonSociale}</h1>
        <Impersonate accountId={accountId} />
      </div>
      <div className="flex items-center justify-between flex-col w-full border-y-[1px] border-y-neutral-200 py-2 my-4">
        <div className="flex items-center justify-between w-full">
          <span>Statut de la structure</span>
          <ToggleSwitch
            label=""
            defaultChecked={maisonMereIsActive}
            inputTitle="Activer toutes les agences de la maison mère"
            onChange={(checked) => handleIsActiveChange(checked)}
          />
        </div>
        <div className="flex items-center justify-between w-full">
          <span>Signaler</span>
          <ToggleSwitch
            label=""
            defaultChecked={maisonMereAAP.isSignalized}
            inputTitle="Activer toutes les agences de la maison mère"
            onChange={(checked) => handleIsSignalizedChange(checked)}
          />
        </div>
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
