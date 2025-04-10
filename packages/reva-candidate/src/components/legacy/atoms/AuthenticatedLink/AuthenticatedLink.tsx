import { SyntheticEvent } from "react";

import { Download } from "@codegouvfr/react-dsfr/Download";

import { useKeycloakContext } from "@/components/auth/keycloak.context";
import { handleAuthenticatedDownload } from "@/utils/handleAuthenticatedDownload.util";

export const AuthenticatedLink = ({
  url,
  text,
  title,
  className,
}: {
  url: string;
  text: string;
  title: string;
  className?: string;
}) => {
  const { accessToken } = useKeycloakContext();

  const handleClick = (e: SyntheticEvent) => {
    if (url && accessToken) {
      handleAuthenticatedDownload(url, accessToken, e);
    }
  };

  return (
    // eslint-disable-next-line jsx-a11y/anchor-is-valid
    <Download
      details="PDF"
      label={text}
      className={className}
      linkProps={{
        onClick: handleClick,
        title: title,
        href: "",
      }}
    />
  );
};
