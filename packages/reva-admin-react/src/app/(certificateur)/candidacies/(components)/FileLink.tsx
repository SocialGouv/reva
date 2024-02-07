import { AuthenticatedLink } from "@/components/authenticated-link/AuthenticatedLink";

export const FileLink = ({ url, text }: { url: string; text: string }) => (
  <AuthenticatedLink
    text={text}
    title={text}
    url={url}
    className="fr-link fr-icon-download-line fr-link--icon-right text-blue-900 text-lg mr-auto break-words"
  />
);
