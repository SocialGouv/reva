import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Tile } from "@codegouvfr/react-dsfr/Tile";

export default function CreateCandidacyPage() {
  return (
    <div>
      <Breadcrumb
        currentPageLabel="Créer une candidature"
        className="mb-4"
        segments={[
          {
            label: "Mes candidatures",
            linkProps: {
              href: `../`,
            },
          },
        ]}
      />

      <h1>Commencer une VAE</h1>

      <p>
        Vous souhaitez commencer un parcours de VAE. Votre entreprise peut avoir
        mis en place une démarche de VAE collective. Renseignez-vous auprès de
        celle-ci avant de vous lancer, cela peut présenter des avantages
        conséquents pour vous.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Tile
          title="Ma démarche est personnelle"
          desc="VAE individuelle"
          linkProps={{
            href: "./certifications",
          }}
          enlargeLinkOrButton
          orientation="vertical"
          imageUrl="/candidat/images/pictograms/avatar.svg"
          imageSvg
        />
        <Tile
          title="Je dispose d'un code VAE collective"
          desc="VAE collective"
          linkProps={{
            href: "./vae-collective",
          }}
          enlargeLinkOrButton
          orientation="vertical"
          imageUrl="/candidat/images/pictograms/company.svg"
          imageSvg
        />
      </div>
    </div>
  );
}
