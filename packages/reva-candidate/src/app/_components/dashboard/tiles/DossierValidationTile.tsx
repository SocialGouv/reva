import Tile from "@codegouvfr/react-dsfr/Tile";
import { useRouter } from "next/navigation";

export const DossierValidationTile = () => {
  const router = useRouter();
  return (
    <Tile
      disabled
      title="Dossier de validation"
      small
      buttonProps={{
        onClick: () => {
          router.push("/dossier-de-validation");
        },
      }}
      imageUrl="/candidat/images/pictograms/binders.svg"
    />
  );
};
