import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";

export default function RemotePage() {
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
    </div>
  );
}
