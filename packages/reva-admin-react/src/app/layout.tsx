"use client";
import { DsfrHead } from "@codegouvfr/react-dsfr/next-appdir/DsfrHead";
import { DsfrProvider } from "@codegouvfr/react-dsfr/next-appdir/DsfrProvider";
import { getHtmlAttributes } from "@codegouvfr/react-dsfr/next-appdir/getHtmlAttributes";
import Link from "next/link";
import "./globals.css";
import { Header } from "@/components/header/Header";
import { Footer } from "@/components/footer/Footer";
import { SkipLinks } from "@codegouvfr/react-dsfr/SkipLinks";
import { SessionProvider, signIn, useSession } from "next-auth/react";
import { defaultColorScheme } from "@/components/dsfr/defaultColorScheme";
import { StartDsfr } from "@/components/dsfr/StartDsfr";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";

export default function RootLayout({ children }: { children: JSX.Element }) {
  const queryClient = new QueryClient();

  return (
    <html {...getHtmlAttributes({ defaultColorScheme })}>
      <head>
        <StartDsfr />
        <DsfrHead Link={Link} />
      </head>
      <body>
        <DsfrProvider>
          <SessionProvider refetchInterval={30} basePath="/admin2/api/auth">
            <QueryClientProvider client={queryClient}>
              <LayoutContent>{children}</LayoutContent>
            </QueryClientProvider>
          </SessionProvider>
        </DsfrProvider>
      </body>
    </html>
  );
}

const LayoutContent = ({ children }: { children: JSX.Element }) => {
  const { status, data: session } = useSession();

  if (status === "unauthenticated") {
    signIn("keycloak");
  }

  //refresh token expiration error handling
  useEffect(() => {
    if ((session as { error?: string })?.error === "RefreshAccessTokenError") {
      signIn("keycloak");
    }
  }, [session]);

  return status == "authenticated" ? (
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
  ) : null;
};
