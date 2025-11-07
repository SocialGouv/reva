import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";

import { PageLayout } from "@/layouts/page.layout";

import { VaeCollectiveCodeForm } from "./_components/VaeCollectiveCodeForm.component";

export default function VaeCollectivePage() {
  return (
    <PageLayout title="Rejoindre une VAE collective">
      <Breadcrumb
        currentPageLabel="VAE collective"
        className="mb-4"
        segments={[
          {
            label: "Mes candidatures",
            linkProps: {
              href: "../../",
            },
          },
          {
            label: "Créer une candidature",
            linkProps: {
              href: "../",
            },
          },
        ]}
      />

      <h1>Rejoindre une VAE collective</h1>

      <p>
        Veuillez renseigner le code qui vous a été transmis par votre porteur de
        projet VAE collective ou votre accompagnateur. Si vous rencontrez des
        problèmes, rapprochez vous d’eux.
      </p>

      <div className="flex flex-col lg:flex-row lg:justify-between gap-20 lg:gap-28">
        <div className="w-full flex-basis-1/2 my-10">
          <VaeCollectiveCodeForm />
        </div>
        <div className="flex flex-col flex-basis-1/2 my-auto">
          <p className="text-xl leading-relaxed">
            <strong>
              Vous n’avez pas de code mais vous êtes intégré à un projet de VAE
              collective ?
            </strong>
            <br />
            <span className="block text-lg">
              Contactez votre référent afin d’obtenir ce code. Il le trouvera
              sur son espace dédié à la gestion de ses cohortes.
            </span>
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
