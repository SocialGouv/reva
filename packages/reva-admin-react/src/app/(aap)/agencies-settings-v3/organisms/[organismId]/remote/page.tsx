"use client";
import { EnhancedSectionCard } from "@/components/card/enhanced-section-card/EnhancedSectionCard";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { useParams } from "next/navigation";

export default function RemotePage() {
  const { organismId } = useParams<{ organismId: string }>();
  return (
    <div className="flex flex-col w-full">
      <Breadcrumb
        currentPageLabel={"Accompagnement à distance"}
        homeLinkProps={{
          href: `/`,
        }}
        segments={[
          {
            label: "Paramètres",
            linkProps: { href: "/agencies-settings-v3" },
          },
        ]}
      />

      <h1>Accompagnement à distance</h1>
      <p>
        Pour être visible complétez tout et mettez l’interrupteur sur visible.
      </p>
      <EnhancedSectionCard
        title="Informations affichées au candidat"
        titleIconClass="fr-icon-information-fill"
        isEditable
        buttonOnClickHref={`/agencies-settings-v3/organisms/${organismId}/remote/information`}
      />
    </div>
  );
}
