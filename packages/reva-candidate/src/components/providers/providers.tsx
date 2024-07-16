"use client";

import { DsfrProvider } from "@codegouvfr/react-dsfr/next-appdir/DsfrProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthGuard } from "../auth/auth.guard";
import { KeycloakProvider } from "../auth/keycloak.context";
import { CandidacyGuard } from "../candidacy/candidacy.context";
import { Header } from "@/components/header/Header";
import SkipLinks from "@codegouvfr/react-dsfr/SkipLinks";
import { Footer } from "../footer/Footer";

const queryClient = new QueryClient();


export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DsfrProvider>
      <KeycloakProvider>
        <QueryClientProvider client={queryClient}>
          <LayoutContent>
            <AuthGuard>
              {({ authenticated }) =>
                authenticated ? (
                  <CandidacyGuard>{children}</CandidacyGuard>
                ) : (
                  children
                )
              }
            </AuthGuard>
          </LayoutContent>
        </QueryClientProvider>
      </KeycloakProvider>
    </DsfrProvider>
  );
}

const LayoutContent = ({ children }: { children: React.ReactNode }) => {
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
        <div className="fr-container flex flex-col flex-1">
          <div
            className={`fr-container lg:shadow-lifted flex-1 md:mt-8 px-1 pt-4 md:px-8 md:pt-8 md:pb-8 fr-grid-row bg-white mb-12`}
          >
            {children}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
