import Image from "next/image";

export const EmptyStateCertificationSearch = ({
  searchFilter,
}: {
  searchFilter: string;
}) => {
  return (
    <div className="flex flex-col justify-center items-center text-center">
      <Image
        width="207"
        height="234"
        src="/admin2/components/no-result.svg"
        alt="Pas de résultat"
      />
      <h3>
        Aucun résultat trouvé {searchFilter ? `pour "${searchFilter}"` : ""}
      </h3>
      {!!searchFilter && (
        <p>
          Nous ne trouvons pas de service régional portant ce nom. Vérifiez
          votre recherche, il se peut qu'une erreur de frappe s'y cache.
        </p>
      )}
      <p>
        Si votre recherche n'aboutit pas, contactez-nous à
        support@vae.gouv.fr.{" "}
      </p>
    </div>
  );
};
