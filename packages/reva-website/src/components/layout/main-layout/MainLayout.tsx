import { ReactNode } from "react";
import { Footer } from "@/components/footer/Footer";
import { Header } from "@/components/header/Header";
import { SkipLinks } from "@codegouvfr/react-dsfr/SkipLinks";

export const MainLayout = (props: {
  children?: ReactNode;
  className?: string;
}) => (
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
);
