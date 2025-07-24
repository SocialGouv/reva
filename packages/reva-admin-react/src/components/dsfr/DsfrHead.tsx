import AppleTouchIcon from "@codegouvfr/react-dsfr/dsfr/favicon/apple-touch-icon.png";
import FaviconIco from "@codegouvfr/react-dsfr/dsfr/favicon/favicon.ico";
import FaviconSvg from "@codegouvfr/react-dsfr/dsfr/favicon/favicon.svg";
import { getAssetUrl } from "@codegouvfr/react-dsfr/tools/getAssetUrl";

export function DsfrHead() {
  return (
    <>
      <link rel="apple-touch-icon" href={getAssetUrl(AppleTouchIcon)} />
      <link rel="icon" href={getAssetUrl(FaviconSvg)} type="image/svg+xml" />
      <link
        rel="shortcut icon"
        href={getAssetUrl(FaviconIco)}
        type="image/x-icon"
      />
    </>
  );
}
