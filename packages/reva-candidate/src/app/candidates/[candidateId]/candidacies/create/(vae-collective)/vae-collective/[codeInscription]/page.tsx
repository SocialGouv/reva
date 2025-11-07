"use client";

import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import Button from "@codegouvfr/react-dsfr/Button";
import { Card } from "@codegouvfr/react-dsfr/Card";
import { useRouter, useParams } from "next/navigation";

import { errorToast } from "@/components/toast/toast";
import { PageLayout } from "@/layouts/page.layout";

import { useCreateVaeCollectiveCandidacy } from "./createVaeCollectiveCandidacy.hook";
import { useGetVaeCollectiveCohort } from "./getVaeCollective.hook";

export default function RejoindreVaeCollectivePage() {
  const { candidateId } = useParams<{ candidateId: string }>();

  const router = useRouter();

  const { createCandidacy } = useCreateVaeCollectiveCandidacy();
  const { isPending: isCreatingCandidacy } = createCandidacy;

  const { cohorteVaeCollective, isLoading: isLoadingCohortVaeCollective } =
    useGetVaeCollectiveCohort();

  const handleCreateCandidacy = async () => {
    const data = await createCandidacy.mutateAsync({
      candidateId: candidateId,
      data: {
        cohorteVaeCollectiveId: cohorteVaeCollective?.id,
      },
    });

    if (data.candidacy_createCandidacy) {
      router.push(`../../../${data.candidacy_createCandidacy.id}`);
    } else {
      errorToast(
        "Une erreur est survenue lors de la création de la candidature",
      );
    }
  };

  return (
    <PageLayout title="Rejoindre cette VAE collective">
      <Breadcrumb
        currentPageLabel={cohorteVaeCollective?.nom}
        className="mb-4"
        segments={[
          {
            label: "Mes candidatures",
            linkProps: {
              href: "../../../",
            },
          },
          {
            label: "Créer une candidature",
            linkProps: {
              href: "../../",
            },
          },
          {
            label: "Rejoindre une VAE collective",
            linkProps: {
              href: "../",
            },
          },
        ]}
      />

      <div className="flex flex-col gap-6">
        <h1 className="mt-4 mb-0">Rejoindre cette VAE collective</h1>

        <p>
          En rejoignant cette cohorte, vous créez une candidature dans le cadre
          des certifications et accompagnateurs pré-sélectionnés par le porteur
          de projet VAE collective de cette cohorte.
        </p>

        {cohorteVaeCollective && (
          <Card
            size="small"
            title={cohorteVaeCollective?.nom}
            detail={
              <div className="flex items-center gap-1">
                <span className="fr-icon-building-fill fr-icon--sm" />
                {cohorteVaeCollective.commanditaireVaeCollective.raisonSociale}
              </div>
            }
            classes={{
              detail: "mt-2",
              end: "m-0 p-0",
            }}
          />
        )}

        <div className="flex flex-row justify-end mt-6">
          <Button
            disabled={
              isCreatingCandidacy ||
              isLoadingCohortVaeCollective ||
              !cohorteVaeCollective
            }
            className="justify-center w-[100%]  md:w-fit"
            onClick={handleCreateCandidacy}
          >
            Rejoindre cette cohorte
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}
