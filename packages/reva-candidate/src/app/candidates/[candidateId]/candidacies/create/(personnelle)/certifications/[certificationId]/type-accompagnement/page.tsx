"use client";

import Breadcrumb from "@codegouvfr/react-dsfr/Breadcrumb";
import { Card } from "@codegouvfr/react-dsfr/Card";
import Tag from "@codegouvfr/react-dsfr/Tag";
import { Tile } from "@codegouvfr/react-dsfr/Tile";
import { useRouter, useParams } from "next/navigation";

import { errorToast } from "@/components/toast/toast";
import { PageLayout } from "@/layouts/page.layout";

import { TypeAccompagnement } from "@/graphql/generated/graphql";

import { useCreateCandidacy } from "./createCandidacy.hook";
import { useGetCertification } from "./getGertification.hook";

export default function TypeAccompagnementPage() {
  const { candidateId } = useParams<{ candidateId: string }>();

  const router = useRouter();

  const { createCandidacy } = useCreateCandidacy();
  const { isPending: isCreatingCandidacy } = createCandidacy;

  const { certification } = useGetCertification();

  if (!certification) {
    return null;
  }

  const certificationLabel = `RNCP ${certification.codeRncp} : ${certification.label}`;

  const handleCreateCandidacy = async (
    typeAccompagnement: TypeAccompagnement,
  ) => {
    const data = await createCandidacy.mutateAsync({
      candidateId: candidateId,
      data: {
        certificationId: certification.id,
        typeAccompagnement: typeAccompagnement,
      },
    });

    if (data.candidacy_createCandidacy) {
      router.push(`../../../../${data.candidacy_createCandidacy.id}`);
    } else {
      errorToast(
        "Une erreur est survenue lors de la création de la candidature",
      );
    }
  };

  return (
    <PageLayout title="Choix du type d'accompagnement">
      <Breadcrumb
        currentPageLabel="Choix du type d'accompagnement"
        className="mb-4"
        segments={[
          {
            label: "Mes candidatures",
            linkProps: {
              href: "../../../../",
            },
          },
          {
            label: "Créer une candidature",
            linkProps: {
              href: "../../../",
            },
          },
          {
            label: "Choix du diplôme",
            linkProps: {
              href: "../../",
            },
          },
          {
            label: certificationLabel,
            linkProps: {
              href: "../",
            },
          },
        ]}
      />

      <div className="flex flex-col gap-12">
        <h1 className="mt-4 mb-0">Ma candidature</h1>

        <Card
          size="small"
          title={certification.label}
          detail={`RNCP ${certification.codeRncp}`}
          key={certification.id}
          start={
            <Tag small>
              {certification?.isAapAvailable
                ? "VAE en autonomie ou accompagnée"
                : "VAE en autonomie"}
            </Tag>
          }
          classes={{
            detail: "mt-2",
            content: "p-6",
            end: "m-0 p-0",
          }}
        />

        <div className="flex flex-col">
          <div className="fr-text--lead font-semibold text-gray-900">
            Comment je souhaite réaliser ma VAE ?
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Tile
              disabled={!certification.isAapAvailable || isCreatingCandidacy}
              enlargeLinkOrButton
              title={"Avec un accompagnateur"}
              desc={
                <>
                  <p>
                    Vous serez accompagné par un expert de la VAE qui vous
                    aidera à chaque grande étape de votre parcours VAE. Une
                    présence de A à Z, utile pour réaliser sereinement votre
                    parcours.
                  </p>
                  <p className="mt-6 font-semibold">
                    Cet accompagnement peut être financé par votre Compte
                    Personnel de Formation.
                  </p>
                </>
              }
              buttonProps={{
                onClick: () => {
                  handleCreateCandidacy("ACCOMPAGNE");
                },
              }}
              orientation="vertical"
              imageUrl="/candidat/images/pictograms/human-cooperation.svg"
              imageSvg
            />

            <Tile
              disabled={isCreatingCandidacy}
              enlargeLinkOrButton
              title="En autonomie"
              desc={
                <>
                  <p>
                    Vous réaliserez toutes les démarches et grandes étapes d’un
                    parcours VAE seul. Pour vous aider, nos articles et
                    tutoriels sont à votre disposition.
                  </p>
                  <p className="mt-6 font-semibold">
                    Les frais de passage devant le jury et les formations
                    complémentaires seront entièrement à votre charge.
                  </p>
                </>
              }
              buttonProps={{
                onClick: () => {
                  handleCreateCandidacy("AUTONOME");
                },
              }}
              orientation="vertical"
              imageUrl="/candidat/images/pictograms/self-training.svg"
              imageSvg
            />
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
