import { AuthenticatedLink } from "../authenticated-link/AuthenticatedLink";

export const DownloadTile = ({
  name,
  url,
  mimeType,
}: {
  name: string;
  url: string;
  mimeType: string;
}) => {
  return (
    <div className="fr-tile fr-tile--download fr-enlarge-link">
      <div className="fr-tile__body">
        <div className="fr-tile__content">
          <h3 className="fr-tile__title">
            <AuthenticatedLink text={name} title={name} url={url} />
          </h3>
          <p className="fr-tile__detail">
            {mimeType.split("/").pop()?.toUpperCase()}
          </p>
        </div>
      </div>
    </div>
  );
};