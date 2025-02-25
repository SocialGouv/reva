import { getAssetUrl } from "@codegouvfr/react-dsfr/tools/getAssetUrl";
import AppleTouchIcon from "@codegouvfr/react-dsfr/dsfr/favicon/apple-touch-icon.png";
import FaviconSvg from "@codegouvfr/react-dsfr/dsfr/favicon/favicon.svg";
import FaviconIco from "@codegouvfr/react-dsfr/dsfr/favicon/favicon.ico";
// import { setLink } from "@codegouvfr/react-dsfr/link";
// import Link from "next/link";
// import { useMemo } from "react";

export function DsfrHead() {
  // useMemo(() => {
  //   if (Link !== undefined) {
  //     setLink({ Link });
  //   }
  // }, []);
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
