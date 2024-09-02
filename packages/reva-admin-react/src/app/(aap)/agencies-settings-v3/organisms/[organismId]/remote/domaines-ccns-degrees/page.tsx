"use client";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { useParams } from "next/navigation";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import DomainesCcnsDegreesForm from "../../_components/domaines-ccns-degrees-form/DomainesCcnsDegreesForm";

const InformationsRemotePage = () => {
  const { organismId } = useParams<{ organismId: string }>();

  return (
    <div className="flex flex-col">
      <Breadcrumb
        currentPageLabel={"Filières, branches et niveaux"}
        homeLinkProps={{
          href: `/`,
        }}
        segments={[
          {
            label: "Paramètres",
            linkProps: { href: "/agencies-settings-v3" },
          },
          {
            label: "Accompagnement à distance",
            linkProps: {
              href: `/agencies-settings-v3/organisms/${organismId}/remote`,
            },
          },
        ]}
      />
      <h1>Filières, branches et niveaux</h1>
      <FormOptionalFieldsDisclaimer />
      <p>
        Sélectionnez toutes les filières, branches et niveaux gérés par votre
        structure.
      </p>
      <DomainesCcnsDegreesForm
        organismId={organismId}
        backButtonUrl={`/agencies-settings-v3/organisms/${organismId}/remote`}
      />
    </div>
  );
};

export default InformationsRemotePage;
