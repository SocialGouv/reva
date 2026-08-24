"use client";

import { Button } from "@codegouvfr/react-dsfr/Button";
import { Tile } from "@codegouvfr/react-dsfr/Tile";
import { useRouter } from "next/navigation";

import { SettingsPageHeader } from "@/components/settings/settings-page-header/SettingsPageHeader";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";

import { useGeneralInformationPage } from "../generalInformationPage.hook";

import { LegalInformationBreadcrumb } from "./_components/LegalInformationBreadcrumb";
import {
  TotalUpdateRequestModal,
  totalUpdateRequestModal,
} from "./_components/TotalUpdateRequestModal";
import { UpdatePreparation } from "./_components/UpdatePreparation";
import { useLegalInformationUpdateRequest } from "./_components/useLegalInformationUpdateRequest";

const LegalInformationPage = () => {
  const router = useRouter();
  const { maisonMereAAP, maisonMereAAPId, isAdmin } =
    useGeneralInformationPage();
  const { sendTotalUpdateRequest, isPending } =
    useLegalInformationUpdateRequest(maisonMereAAPId);

  const generalInformationUrl = `/agencies-settings-v3/${maisonMereAAPId}/general-information`;

  const handleTotalUpdateRequest = async ({
    makeInvisible,
  }: {
    makeInvisible: boolean;
  }) => {
    try {
      await sendTotalUpdateRequest({ makeInvisible });
      totalUpdateRequestModal.close();
      successToast("La demande de mise à jour a bien été envoyée");
      router.push(generalInformationUrl);
    } catch (error) {
      graphqlErrorToast(error);
    }
  };

  // L'AAP n'a pas d'écran de choix: la tuile ouvre directement la page de
  // préparation, puis les quatre étapes.
  if (!isAdmin) {
    return <UpdatePreparation maisonMereAAPId={maisonMereAAPId} />;
  }

  return (
    <div className="flex flex-col w-full">
      <SettingsPageHeader
        breadcrumb={
          <LegalInformationBreadcrumb
            isAdmin
            maisonMereAAPId={maisonMereAAPId}
            raisonSociale={maisonMereAAP?.raisonSociale}
          />
        }
        title="Mise à jour des informations générales"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Tile
          title="Faire une demande de mise à jour totale"
          desc="Permet d'envoyer une demande de mise à jour totale à la structure accompagnatrice afin de vérifier l'ensemble de ses informations et statut juridique."
          small
          enlargeLinkOrButton
          buttonProps={{ onClick: totalUpdateRequestModal.open }}
        />
        <Tile
          title="Faire une mise à jour partielle"
          desc="Permet de modifier une information après avoir échangé avec la structure accompagnatrice et vérifié les informations et pièces justificatives fournies."
          small
          enlargeLinkOrButton
          linkProps={{
            href: `${generalInformationUrl}/legal-information/targeted`,
          }}
        />
      </div>
      <Button
        className="mt-12 mr-auto"
        priority="secondary"
        linkProps={{ href: generalInformationUrl }}
      >
        Annuler
      </Button>
      <TotalUpdateRequestModal
        onConfirm={handleTotalUpdateRequest}
        disabled={isPending}
      />
    </div>
  );
};

export default LegalInformationPage;
