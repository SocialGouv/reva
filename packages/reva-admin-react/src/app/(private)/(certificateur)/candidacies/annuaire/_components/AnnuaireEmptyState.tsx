import Button from "@codegouvfr/react-dsfr/Button";
import Image from "next/image";

export const AnnuaireEmptyState = ({
  onClearFilters,
  hasActiveFilters,
}: {
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <Image
        src="/admin2/components/no-result.svg"
        alt="Pas de résultat"
        width={282}
        height={319}
      />
      <h2 className="mb-10">Aucun résultat pour votre recherche</h2>
      {hasActiveFilters && (
        <Button priority="secondary" onClick={onClearFilters}>
          Effacer les filtres
        </Button>
      )}
    </div>
  );
};
