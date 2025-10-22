import { Tile } from "@codegouvfr/react-dsfr/Tile";

import { TypeAccompagnement } from "@/graphql/generated/graphql";

export const CandidateRegistrationStep1 = ({
  isAapAvailable,
  onSubmit,
}: {
  onSubmit: (type: TypeAccompagnement) => void;
  isAapAvailable: boolean;
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
          disabled={!isAapAvailable}
          enlargeLinkOrButton
          title={"Avec un accompagnateur"}
          desc={
            <>
              <p>
                Vous serez accompagné par un expert de la VAE qui vous aidera à
                chaque grande étape de votre parcours VAE. Une présence de A à
                Z, utile pour réaliser sereinement votre parcours.
              </p>
              <p className="mt-6 font-semibold">
                Cet accompagnement peut être financé par votre Compte Personnel
                de Formation.
              </p>
            </>
          }
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
          desc={
            <>
              <p>
                Vous réaliserez toutes les démarches et grandes étapes d’un
                parcours VAE seul. Pour vous aider, nos articles et tutoriels
                sont à votre disposition.
              </p>
              <p className="mt-6 font-semibold">
                Les frais de passage devant le jury et les formations
                complémentaires seront entièrement à votre charge.
              </p>
            </>
          }
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
