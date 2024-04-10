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
    <div className="flex flex-col gap-2 mt-2">
      <p className="truncate">{email}</p>
      {phone && <p>{phone}</p>}
      {location && (
        <div className="flex justify-end gap-1 mt-2 lg:mt-0">
          {location.isOnSite && (
            <Tag className="bg-dsfrBlue-500 text-white">Sur place</Tag>
          )}
          {location.isRemote && (
            <Tag className="bg-dsfrBlue-300 text-dsfrBlue-500">À distance</Tag>
          )}
        </div>
      )}
    </div>
  );
};
