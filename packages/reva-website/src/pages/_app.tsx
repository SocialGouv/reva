import "@/styles/globals.legacy.css";
import "@/styles/dsfr-theme-tac.min.css";
import "@/styles/dsfr-theme-tac-extra.css";
import "@/styles/ckeditor5-content-styles.css";

import { createNextDsfrIntegrationApi } from "@codegouvfr/react-dsfr/next-pagesdir";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AppProps } from "next/app";
import Link from "next/link";
import { Toaster } from "react-hot-toast";

declare module "@codegouvfr/react-dsfr/next-pagesdir" {
  interface RegisterLink {
    Link: typeof Link;
  }
}

const { withDsfr, dsfrDocumentApi } = createNextDsfrIntegrationApi({
  defaultColorScheme: "light",
  Link,
});

export { dsfrDocumentApi };

const queryClient = new QueryClient();

function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" />
      <Component {...pageProps} />
    </QueryClientProvider>
  );
}

export default withDsfr(App);
