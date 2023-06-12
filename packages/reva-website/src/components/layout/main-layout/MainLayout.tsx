import { TarteAuCitronWrapper } from "@/components/analytics/tarteaucitron/TarteAuCitronWrapper";
import { Footer } from "@/components/footer/Footer";
import { Header } from "@/components/header/Header";
import { SkipLinks } from "@codegouvfr/react-dsfr/SkipLinks";
import { ReactNode } from "react";

export const MainLayout = (props: {
  children?: ReactNode;
  className?: string;
}) => {
  return (
    <>
      <TarteAuCitronWrapper />
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
};
