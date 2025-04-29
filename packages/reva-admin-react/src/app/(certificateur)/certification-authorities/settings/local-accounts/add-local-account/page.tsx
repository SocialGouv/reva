"use client";
import { EnhancedSectionCard } from "@/components/card/enhanced-section-card/EnhancedSectionCard";
import { SmallNotice } from "@/components/small-notice/SmallNotice";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Button } from "@codegouvfr/react-dsfr/Button";

export default function AddLocalAccountPage() {
  return (
    <div className="flex flex-col">
      <Breadcrumb
        segments={[
          {
            label: "Paramètres",
            linkProps: { href: "/certification-authorities/settings/" },
          },
        ]}
        currentPageLabel="Nouveau un compte local"
      />
      <h1>Nouveau compte local</h1>
      <p className="mb-12">
        Retrouvez l’ensemble des informations liées à ce compte local.
      </p>
      <div className="w-full flex flex-col gap-8">
        <EnhancedSectionCard
          title="Informations générales"
          titleIconClass="fr-icon-information-fill"
          status="TO_COMPLETE"
          isEditable
          buttonOnClickHref="/certification-authorities/settings/local-accounts/add-local-account/informations-generales"
        >
          <SmallNotice>
            Commencez par remplir les informations générales liées au compte.
          </SmallNotice>
        </EnhancedSectionCard>
        <EnhancedSectionCard
          title="Zone d’intervention"
          titleIconClass="fr-icon-road-map-fill"
          status="TO_COMPLETE"
          isEditable
          buttonOnClickHref="#"
          disabled
        />
        <EnhancedSectionCard
          title="Certifications gérées"
          titleIconClass="fr-icon-award-fill"
          status="TO_COMPLETE"
          isEditable
          buttonOnClickHref="#"
          disabled
        />
      </div>
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
