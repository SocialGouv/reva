import { Tile } from "@codegouvfr/react-dsfr/Tile";
import { TypeAccompagnement } from "@/graphql/generated/graphql";

export const CandidateRegistrationStep1 = ({
  onSubmit,
}: {
  onSubmit: (type: TypeAccompagnement) => void;
}) => {
  return (
    <>
      <div className="fr-text--lead font-semibold text-gray-900">
        Comment je souhaite réaliser ma VAE ?
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Tile
          enlargeLinkOrButton
          title={"Avec un accompagnateur"}
          buttonProps={{
            onClick: () => {
              onSubmit("ACCOMPAGNE");
            },
          }}
        />
        <Tile
          enlargeLinkOrButton
          title="En autonomie"
          buttonProps={{
            onClick: () => {
              onSubmit("AUTONOME");
            },
          }}
        />
      </div>
    </>
  );
};
