import { Button } from "@codegouvfr/react-dsfr/Button";
import Image from "next/image";

import emptyStatePolygon from "./assets/empty-state-polygon.svg";

export const MultiSelectListEmptyState = ({
  title = "Aucun résultat trouvé",
  description = "",
  showAllItemsButtonLabel = "Afficher tous les éléments",
  onShowAllItemsButtonClick,
}: {
  title?: string;
  description?: string;
  showAllItemsButtonLabel?: string;
  onShowAllItemsButtonClick?: () => void;
}) => (
  <div className="w-full flex flex-col items-center md:flex-col-reverse">
    <div className="mt-6 md:mt-0 flex flex-col md:items-center">
      <h2>{title}</h2>
      {description && (
        <p className="text-xl mb-10 text-left md:text-center max-w-xl">
          {description}
        </p>
      )}
      <Button
        className="w-full flex justify-center md:justify-start md:w-auto"
        onClick={onShowAllItemsButtonClick}
      >
        {showAllItemsButtonLabel}
      </Button>
    </div>
    <Image src={emptyStatePolygon} alt="icône pas de résultat" />
  </div>
);
