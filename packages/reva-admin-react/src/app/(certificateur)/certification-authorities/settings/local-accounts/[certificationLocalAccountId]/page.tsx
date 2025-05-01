"use client";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useParams } from "next/navigation";
import { useUpdateLocalAccountPage } from "./updateLocalAccountPage.hook";
export default function UpdateLocalAccountPage() {
  const { certificationLocalAccountId } = useParams<{
    certificationLocalAccountId: string;
  }>();

  const { certificationAuthorityLocalAccount } = useUpdateLocalAccountPage({
    certificationAuthorityLocalAccountId: certificationLocalAccountId,
  });

  const localAccountLabel = `${certificationAuthorityLocalAccount?.account.firstname} ${certificationAuthorityLocalAccount?.account.lastname}`;

  return (
    <div className="flex flex-col">
      <Breadcrumb
        segments={[
          {
            label: "Paramètres",
            linkProps: { href: "/certification-authorities/settings/" },
          },
        ]}
        currentPageLabel={localAccountLabel}
      />
      <h1>{localAccountLabel}</h1>
      <p className="mb-12">
        Retrouvez l’ensemble des informations liées à ce compte local.
      </p>
      <div className="w-full flex flex-col gap-8"></div>
      <Button
        className="mt-12"
        priority="secondary"
        linkProps={{
          href: "/certification-authorities/settings/",
        }}
      >
        Annuler
      </Button>
    </div>
  );
}
