import { Tag } from "@codegouvfr/react-dsfr/Tag";

export const OrganismCardDescription = ({
  email,
  phone,
  location,
}: {
  email: string;
  phone: string | null;
  location?: {
    isOnSite: boolean;
    isRemote: boolean;
  };
}) => {
  return (
    <>
      <p className="truncate">
        <span
          className="fr-icon-mail-line fr-icon--sm mr-2"
          aria-hidden="true"
        ></span>
        {email}
      </p>
      {phone && (
        <p>
          <span
            className="fr-icon-phone-line fr-icon--sm mr-2"
            aria-hidden="true"
          ></span>
          {phone}
        </p>
      )}
      {location && (
        <div className="flex justify-end gap-1 mt-4">
          {location.isOnSite && (
            <Tag className="bg-dsfrBlue-500 text-white">Sur place</Tag>
          )}
          {location.isRemote && (
            <Tag className="bg-dsfrBlue-300 text-dsfrBlue-500">À distance</Tag>
          )}
        </div>
      )}
    </>
  );
};
