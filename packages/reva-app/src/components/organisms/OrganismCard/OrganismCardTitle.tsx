const ensureProtocol = (url: string) => {
  const protocolRegex = /^[a-zA-Z]+:\/\//;
  if (!protocolRegex.test(url)) {
    url = "https://" + url;
  }
  return url;
};

export const OrganismCardTitle = ({
  website,
  label,
}: {
  website?: string;
  label: string;
}) => {
  return (
    <div className="font-semibold">
      {website ? (
        <a
          className="fr-link text-xl"
          href={ensureProtocol(website)}
          target="_blank"
          rel="noreferrer"
        >
          {label}
        </a>
      ) : (
        <span className="text-xl">{label}</span>
      )}
    </div>
  );
};
