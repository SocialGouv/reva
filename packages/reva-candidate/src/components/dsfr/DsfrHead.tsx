import AppleTouchIcon from "@codegouvfr/react-dsfr/dsfr/favicon/apple-touch-icon.png";
import FaviconIco from "@codegouvfr/react-dsfr/dsfr/favicon/favicon.ico";
import FaviconSvg from "@codegouvfr/react-dsfr/dsfr/favicon/favicon.svg";
import { getAssetUrl } from "@codegouvfr/react-dsfr/tools/getAssetUrl";
import { setLink } from "@codegouvfr/react-dsfr/link";
import Link from "next/link";
import { useMemo } from "react";

export function DsfrHead() {
  useMemo(() => {
    if (Link !== undefined) {
      setLink({ Link });
    }
  }, []);
  return (
    <>
      <link rel="apple-touch-icon" href={getAssetUrl(AppleTouchIcon)} />
      <link rel="icon" href={getAssetUrl(FaviconSvg)} type="image/svg+xml" />
      <link
        rel="shortcut icon"
        href={getAssetUrl(FaviconIco)}
        type="image/x-icon"
      />
      <title>France VAE | Bienvenue sur le portail de la VAE</title>
      <meta
        name="description"
        content="Découvrez la version beta du portail officiel du service public de la Validation des Acquis de L'Expérience."
      />
    </>
  );
}
