"use client";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useParams } from "next/navigation";

import { usePositionnementPage } from "./positionnement.hook";

const PositionnementPage = () => {
  const {
    "maison-mere-id": maisonMereAAPId,
    userAccountId,
  }: { "maison-mere-id": string; userAccountId: string } = useParams<{
    "maison-mere-id": string;
    userAccountId: string;
  }>();

  const { userAccount } = usePositionnementPage({
    maisonMereAAPId,
    userAccountId,
  });
  const backUrl = `/agencies-settings-v3/${maisonMereAAPId}/user-accounts-v2/${userAccountId}`;

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
