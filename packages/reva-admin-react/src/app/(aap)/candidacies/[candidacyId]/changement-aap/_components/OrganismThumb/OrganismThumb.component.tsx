interface Props {
  label?: string;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
}

export const OrganismThumb = (props: Props) => {
  const { label, email, phone, website } = props;

  return (
    <div className="bg-gray-100 p-4 rounded-xl flex flex-col gap-2">
      {website ? (
        <a
          className="fr-link text-lg font-bold mr-auto"
          href={ensureProtocol(website)}
          target="_blank"
          rel="noreferrer"
        >
          {label}
        </a>
      ) : (
        <span className="text-lg font-bold">{label}</span>
      )}

      <p className="truncate mb-0">
        <span
          className="fr-icon-mail-line fr-icon--sm mr-2"
          aria-hidden="true"
        ></span>
        <a
          data-testid="project-organisms-organism-email"
          href={`mailto:${email}`}
        >
          {email}
        </a>
      </p>

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
    </div>
  );
};

const ensureProtocol = (url: string) => {
  const protocolRegex = /^[a-zA-Z]+:\/\//;
  if (!protocolRegex.test(url)) {
    url = "https://" + url;
  }
  return url;
};
