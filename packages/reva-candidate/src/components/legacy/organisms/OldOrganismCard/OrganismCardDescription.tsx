import { Tag } from "@codegouvfr/react-dsfr/Tag";

export const OrganismCardDescription = ({
  email,
  phone,
  isOnSite,
  isRemote,
  isMCFCompatible,
}: {
  email: string;
  phone: string | null;
  isOnSite: boolean;
  isRemote: boolean;
  isMCFCompatible: boolean;
}) => {
  return (
    <>
      <p className="truncate mb-0">
        <span
          className="fr-icon-mail-line fr-icon--sm mr-2"
          aria-hidden="true"
        ></span>
        <a
          data-test="project-organisms-organism-email"
          href={`mailto:${email}`}
        >
          {email}
        </a>
      </p>

      <div className="flex flex-wrap justify-between gap-4">
        <p data-test="project-organisms-organism-phone" className="mb-0">
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
        <div className="flex gap-2 -mt-1">
          {isOnSite && (
            <Tag
              data-test="project-organisms-onsite-tag"
              className="min-h-4 text-xs sm:text-sm sm:min-h-8"
            >
              <span
                aria-hidden="true"
                className="sm:hidden fr-icon-building-fill fr-icon--xs mr-1"
              />
              Sur site
            </Tag>
          )}
          {isRemote && (
            <Tag
              data-test="project-organisms-remote-tag"
              className="min-h-4 text-xs sm:text-sm sm:min-h-8"
            >
              <span
                aria-hidden="true"
                className="sm:hidden fr-icon-customer-service-fill fr-icon--xs mr-1"
              />
              À distance
            </Tag>
          )}
          {isMCFCompatible && (
            <Tag
              data-test="project-organisms-mcf-tag"
              className="min-h-4 text-xs sm:text-sm sm:min-h-8"
            >
              <span
                aria-hidden="true"
                className="sm:hidden fr-icon-customer-service-fill fr-icon--xs mr-1"
              />
              MCF
            </Tag>
          )}
        </div>
      </div>
    </>
  );
};
