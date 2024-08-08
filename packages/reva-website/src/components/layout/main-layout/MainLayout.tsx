import { Footer } from "@/components/footer/Footer";
import { Header } from "@/components/header/Header";
import { SkipLinks } from "@codegouvfr/react-dsfr/SkipLinks";
import Link from "next/link";
import { ReactNode } from "react";

export const MainLayout = (props: {
  children?: ReactNode;
  className?: string;
  preview?: boolean;
}) => {
  return (
    <>
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
        <div>
          {props.preview ? (
            <div className="relative bg-dsfrBlue-franceSun">
              <div className="max-w-7xl mx-auto py-3 px-3 sm:px-6 lg:px-8">
                <div className="pr-16 sm:text-center sm:px-16">
                  <p className="font-medium text-white mb-0">
                    <span>Le mode prévisualisation est actif.</span>
                    <span className="block sm:ml-2 sm:inline-block">
                      <Link
                        href="/websiteapi/exit-preview"
                        className="hover:text-cyan transition-colors"
                      >
                        Cliquez ici pour le quitter
                      </Link>
                    </span>
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
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
