import { Tile } from "@codegouvfr/react-dsfr/Tile";
import { TypeAccompagnement } from "@/graphql/generated/graphql";

export const CandidateRegistrationStep1 = ({
  onSubmit,
}: {
  onSubmit: (type: TypeAccompagnement) => void;
}) => {
  return (
    <>
      <div
        data-testid="candidate-registration-initial-step"
        className="fr-text--lead font-semibold text-gray-900"
      >
        Comment je souhaite réaliser ma VAE ?
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Tile
          data-testid="tile-accompagne"
          enlargeLinkOrButton
          title={"Avec un accompagnateur"}
          desc="Vous serez accompagné par un expert de la VAE qui vous aidera à chaque grande étape de votre parcours VAE. Une présence de A à Z, utile pour réaliser sereinement votre parcours."
          buttonProps={{
            onClick: () => {
              onSubmit("ACCOMPAGNE");
            },
          }}
          orientation="vertical"
          imageUrl="/candidate-space/pictograms/human-cooperation.svg"
          imageSvg
        />
        <Tile
          data-testid="tile-autonome"
          enlargeLinkOrButton
          title="En autonomie"
          desc="Vous réaliserez toutes les démarches et grandes étapes d'un parcours VAE en toute autonomie. Pour vous aider, nos articles de blog, tutos et webinaires seront là."
          buttonProps={{
            onClick: () => {
              onSubmit("AUTONOME");
            },
          }}
          orientation="vertical"
          imageUrl="/candidate-space/pictograms/self-training.svg"
          imageSvg
        />
      </div>
    </>
  );
};
