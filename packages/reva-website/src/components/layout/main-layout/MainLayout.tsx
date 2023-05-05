import { ReactNode } from "react";
import { Footer } from "@/components/footer/Footer";
import { Header } from "@/components/header/Header";
import { SkipLinks } from "@codegouvfr/react-dsfr/SkipLinks";
import Script from "next/script";
import { MATOMO_CONTAINER_URL } from "@/config/config";

const matomoTrackingScript = MATOMO_CONTAINER_URL
  ? `
var _mtm = window._mtm = window._mtm || [];
_mtm.push({'mtm.startTime': (new Date().getTime()), 'event': 'mtm.Start'});
var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
g.async=true; g.src='${MATOMO_CONTAINER_URL}'; 
s.parentNode.insertBefore(g,s);`
  : "";

export const MainLayout = (props: {
  children?: ReactNode;
  className?: string;
}) => (
  <>
    <Script id="matomoTrackingScript">{matomoTrackingScript}</Script>
    <div className="min-h-screen flex flex-col">
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
        className={`flex-1 flex flex-col ${props.className}`}
      >
        {props.children}
      </main>
      <Footer />
    </div>
  </>
);
