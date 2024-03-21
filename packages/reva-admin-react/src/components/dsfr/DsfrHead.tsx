// Forked DsfrHead from react-dsfr and remove scss imports to keep control of ordering

import { getAssetUrl } from "@codegouvfr/react-dsfr/tools/getAssetUrl";
import AppleTouchIcon from "@codegouvfr/react-dsfr/dsfr/favicon/apple-touch-icon.png";
import FaviconSvg from "@codegouvfr/react-dsfr/dsfr/favicon/favicon.svg";
import FaviconIco from "@codegouvfr/react-dsfr/dsfr/favicon/favicon.ico";

import Link from "next/link";

export function DsfrHead() {
  return (
    <>
      <Link rel="apple-touch-icon" href={getAssetUrl(AppleTouchIcon)} />
      <Link rel="icon" href={getAssetUrl(FaviconSvg)} type="image/svg+xml" />
      <Link
        rel="shortcut icon"
        href={getAssetUrl(FaviconIco)}
        type="image/x-icon"
      />
    </>
  );
}
