"use client";
import { HeadAgencySettingsSummary } from "@/app/(aap)/agencies-settings-v3/_components/agencies-settings-summary/HeadAgencySettingsSummary";
import { Impersonate } from "@/components/impersonate";
import { successToast } from "@/components/toast/toast";
import { MaisonMereAap, Organism } from "@/graphql/generated/graphql";
import ToggleSwitch from "@codegouvfr/react-dsfr/ToggleSwitch";
import { useParams } from "next/navigation";
import { useMaisonMereAAP } from "./_components/maisonMereAAP.hook";
import Button from "@codegouvfr/react-dsfr/Button";

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

  if (!maisonMereAAP) return null;

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
      <div className="flex w-full">
        <h1>{maisonMereAAP.raisonSociale}</h1>
        <div className="flex-1 flex w-full gap-4 justify-end">
          <Impersonate accountId={accountId} />
          <div>
            <Button
              priority="secondary"
              linkProps={{
                href: `/candidacies/?status=ACTIVE_HORS_ABANDON&page=1&maisonMereAAPId=${maisonMereAAPId}`,
                target: "_blank",
              }}
            >
              Voir les candidatures
            </Button>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between flex-col w-full  py-2 my-4">
        <div className="flex items-center justify-between w-full border-y-[1px] border-y-neutral-200">
          <span>Statut de la structure</span>
          <ToggleSwitch
            label=""
            defaultChecked={maisonMereAAP.isActive}
            inputTitle="Activer toutes les agences de la maison mère"
            onChange={(checked) => handleIsActiveChange(checked)}
          />
        </div>
        <div className="flex items-center justify-between w-full flex-wrap pb-4 border-b-[1px] border-y-neutral-200">
          <span>Signaler cette structure</span>
          <ToggleSwitch
            label=""
            defaultChecked={maisonMereAAP.isSignalized}
            inputTitle="Signaler la maison mère"
            onChange={(checked) => handleIsSignalizedChange(checked)}
          />
          <span className="text-xs text-dsfrGray-mentionGrey">
            À utiliser lorsqu’un ou plusieurs candidats se plaignent des délais
            de traitement de cette strucure. Les stuctures signalées auront un
            badge permettant de les repérer plus facilement.
          </span>
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
