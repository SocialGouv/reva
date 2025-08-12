import SkipLinks from "@codegouvfr/react-dsfr/SkipLinks";

import { Footer } from "@/components/footer/Footer";

import { Header } from "./Header";

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
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
      {children}
      <Footer />
    </div>
  );
};
