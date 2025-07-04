import { Footer } from "@/components/footer/Footer";
import { Header } from "@/components/header/Header";
import { SkipLinks } from "@codegouvfr/react-dsfr/SkipLinks";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "France VAE | L’outil qui facilite le suivi des candidats à la VAE",
  description: "Espace commanditaire France VAE",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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

      <main
        role="main"
        id="content"
        className="flex flex-col flex-1 lg:bg-candidate"
      >
        <div>
          <div
            className={`flex-1 md:mt-4 pt-4 md:pt-8 md:pb-8 fr-grid-row mb-12`}
          >
            {children}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
