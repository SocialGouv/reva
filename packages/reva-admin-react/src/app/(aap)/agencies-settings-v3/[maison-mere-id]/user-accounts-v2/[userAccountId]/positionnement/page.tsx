"use client";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Tag } from "@codegouvfr/react-dsfr/Tag";
import { useParams } from "next/navigation";
import { useMemo } from "react";

import { MultiSelectList } from "@/components/multi-select-list/MultiSelectList";

import { Organism } from "@/graphql/generated/graphql";

import { usePositionnementPage } from "./positionnement.hook";

const PositionnementPage = () => {
  const {
    "maison-mere-id": maisonMereAAPId,
    userAccountId,
  }: { "maison-mere-id": string; userAccountId: string } = useParams<{
    "maison-mere-id": string;
    userAccountId: string;
  }>();

  const {
    userAccount,
    maisonMereAAPOrganisms,
    updatePositionnementCollaborateur,
  } = usePositionnementPage({
    maisonMereAAPId,
    userAccountId,
  });
  const backUrl = `/agencies-settings-v3/${maisonMereAAPId}/user-accounts-v2/${userAccountId}`;

  const userOrganismIds = useMemo(
    () => userAccount?.organisms.map((o) => o.id) || [],
    [userAccount?.organisms],
  );

  if (!userAccount) {
    return null;
  }
  return (
    <div className="w-full flex flex-col">
      <Breadcrumb
        currentPageLabel="Positionnement"
        segments={[
          {
            label: "Paramètres",
            linkProps: { href: "/agencies-settings-v3" },
          },
          {
            label: userAccount.lastname + " " + userAccount.firstname,
            linkProps: {
              href: `/agencies-settings-v3/${maisonMereAAPId}/user-accounts-v2/${userAccountId}`,
            },
          },
        ]}
      />
      <h1>Positionnement</h1>
      <p className="text-xl mb-12">
        Ajoutez tous les lieux d’accueil et accompagnement à distance au
        positionnement de votre collaborateur. Il aura alors accès à toutes les
        candidatures reçues.
      </p>

      <MultiSelectList
        className="mb-12"
        pageItems={maisonMereAAPOrganisms.map((organism) =>
          getOrganismMultiSelectItem({ organism }),
        )}
        selectedItemsIds={userOrganismIds}
        onSelectionChange={({ itemId, selected }) => {
          updatePositionnementCollaborateur.mutate({
            accountId: userAccountId,
            organismIds: selected
              ? [...userOrganismIds, itemId]
              : userOrganismIds.filter((id) => id !== itemId),
          });
        }}
      />
      <Button
        priority="secondary"
        className="mt-auto"
        linkProps={{ href: backUrl }}
      >
        Retour
      </Button>
    </div>
  );
};

export default PositionnementPage;

const getOrganismMultiSelectItem = ({
  organism,
}: {
  organism: Pick<
    Organism,
    | "id"
    | "label"
    | "modaliteAccompagnement"
    | "disponiblePourVaeCollective"
    | "adresseNumeroEtNomDeRue"
    | "adresseInformationsComplementaires"
    | "adresseCodePostal"
    | "adresseVille"
    | "conformeNormesAccessibilite"
  >;
}) => ({
  id: organism.id,
  title: organism.label,
  start: (
    <div className="flex gap-2">
      {organism.modaliteAccompagnement === "A_DISTANCE" && (
        <Tag small iconId="fr-icon-customer-service-fill">
          À distance
        </Tag>
      )}
      {organism.modaliteAccompagnement === "LIEU_ACCUEIL" && (
        <Tag small iconId="fr-icon-home-4-fill">
          Sur site
        </Tag>
      )}
      {organism.disponiblePourVaeCollective && <Tag small>VAE collective</Tag>}
    </div>
  ),
  desc: (
    <span className="flex flex-col gap-2">
      <span className="text-sm mb-0">
        {[
          organism.adresseNumeroEtNomDeRue,
          organism.adresseInformationsComplementaires,
          organism.adresseCodePostal,
          organism.adresseVille,
        ]
          .filter(Boolean)
          .join(" ")}
      </span>
      {organism.conformeNormesAccessibilite === "CONFORME" && (
        <span className="text-sm mt-0.5 mb-0">
          <span
            className="fr-icon-wheelchair-fill fr-icon--xs mr-1"
            aria-hidden="true"
          ></span>
          Accessibilité PMR
        </span>
      )}
    </span>
  ),
});
