import { DsfrHead } from "@codegouvfr/react-dsfr/next-appdir/DsfrHead";
import { DsfrProvider } from "@codegouvfr/react-dsfr/next-appdir/DsfrProvider";
import { getHtmlAttributes } from "@codegouvfr/react-dsfr/next-appdir/getHtmlAttributes";
import { StartDsfr } from "./StartDsfr";
import { defaultColorScheme } from "./defaultColorScheme";
import Link from "next/link";
import "./globals.css";
import { Header } from "@/components/header/Header";
import { Footer } from "@/components/footer/Footer";
import { SkipLinks } from "@codegouvfr/react-dsfr/SkipLinks";

export default function RootLayout({ children }: { children: JSX.Element }) {
  //NOTE: The lang parameter is optional and defaults to "fr"
  const lang = "fr";
  return (
    <html {...getHtmlAttributes({ defaultColorScheme, lang })}>
      <head>
        <StartDsfr />
        <DsfrHead Link={Link} />
      </head>
      <body>
        <DsfrProvider lang={lang}>
          <div className="w-full min-h-screen flex flex-col">
            <SkipLinks
              links={[
                {
                  anchor: "#content",
                  label: "Contenu",
                },
                {
                  anchor: "#footer",
                  label: "Pied de page",
                },
              ]}
            />
            <Header />
            <main
              role="main"
              id="content"
              className="flex-1 md:bg-gradient-to-r from-[#557AFF] to-[#2400FF] md:pt-16 pb-12"
            >
              {children}
            </main>
            <Footer />
          </div>
        </DsfrProvider>
      </body>
    </html>
  );
}
