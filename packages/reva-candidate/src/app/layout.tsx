import { getHtmlAttributes } from "@codegouvfr/react-dsfr/next-appdir/getHtmlAttributes";
import { setDefaultOptions } from "date-fns";
import { fr } from "date-fns/locale";
import "./globals.css";

import { DsfrHead } from "@/components/dsfr/DsfrHead";
import { StartDsfr } from "@/components/dsfr/StartDsfr";
import { defaultColorScheme } from "@/components/dsfr/defaultColorScheme";
import Providers from "@/components/providers/providers";

setDefaultOptions({ locale: fr });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html {...getHtmlAttributes({ defaultColorScheme })}>
      <head>
        <StartDsfr />
        <DsfrHead />

        <title>France VAE</title>
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}