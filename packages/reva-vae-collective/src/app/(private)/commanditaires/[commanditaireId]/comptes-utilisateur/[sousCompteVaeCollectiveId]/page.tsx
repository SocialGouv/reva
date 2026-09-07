import { Button } from "@codegouvfr/react-dsfr/Button";

import { RoleDependentBreadcrumb } from "@/components/role-dependent-breadcrumb/RoleDependentBreadcrumb";

import { getSousCompteVaeCollective } from "./actions";
import { SousCompteVaeCollectiveForm } from "./form";

export default async function UpdateCohortNamePage({
  params,
}: {
  params: Promise<{
    commanditaireId: string;
    sousCompteVaeCollectiveId: string;
  }>;
}) {
  const { commanditaireId, sousCompteVaeCollectiveId } = await params;

  const sousCompte = await getSousCompteVaeCollective({
    commanditaireVaeCollectiveId: commanditaireId,
    sousCompteVaeCollectiveId,
  });

  if (!sousCompte) {
    throw new Error("Compte utilisateur non trouvé");
  }

  return (
    <div className="flex flex-col w-full">
      <RoleDependentBreadcrumb
        className="mt-0 mb-4"
        segments={[
          {
            label: "Comptes utilisateur",
            linkProps: {
              href: `/commanditaires/${commanditaireId}/comptes-utilisateur`,
            },
          },
        ]}
        currentPageLabel={`${sousCompte?.account?.lastname} ${sousCompte?.account?.firstname}`}
      />
      <h1 className="mb-12">
        {sousCompte?.account?.lastname} {sousCompte?.account?.firstname}
      </h1>
      <SousCompteVaeCollectiveForm
        commanditaireId={commanditaireId}
        sousCompteVaeCollectiveId={sousCompteVaeCollectiveId}
        email={sousCompte?.account?.email}
        canCreateCohorteVaeCollective={
          sousCompte?.canCreateCohorteVaeCollective
        }
      />
      <Button
        className="mt-12"
        priority="secondary"
        linkProps={{
          href: `/commanditaires/${commanditaireId}/comptes-utilisateur`,
        }}
      >
        Retour
      </Button>
    </div>
  );
}
