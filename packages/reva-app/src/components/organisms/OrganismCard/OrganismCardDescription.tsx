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
      <p className="truncate mb-0">
        <span
          className="fr-icon-mail-line fr-icon--sm mr-2"
          aria-hidden="true"
        ></span>
        <a href={`mailto:${email}`}>{email}</a>
      </p>

      <div className="flex flex-wrap justify-between gap-4">
        <p className="mb-0">
          {phone && (
            <>
              <span
                className="fr-icon-phone-line fr-icon--sm mr-2"
                aria-hidden="true"
              ></span>
              {phone}
            </>
          )}
        </p>
        {location && (
          <div className="flex gap-1 -mt-1">
            {location.isOnSite && (
              <Tag className="min-h-4 text-xs sm:text-sm sm:min-h-8">
                <span
                  aria-hidden="true"
                  className="sm:hidden fr-icon-building-fill fr-icon--xs mr-1"
                />
                Sur site
              </Tag>
            )}
            {location.isRemote && (
              <Tag className="min-h-4 text-xs sm:text-sm sm:min-h-8">
                <span
                  aria-hidden="true"
                  className="sm:hidden fr-icon-customer-service-fill fr-icon--xs mr-1"
                />
                À distance
              </Tag>
            )}
          </div>
        )}
      </div>
    </>
  );
};
