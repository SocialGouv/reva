import "../styles/globals.css";
import type { AppProps } from "next/app";
import { MainContextProvider } from "../components/main-context/MainContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Footer } from "../components/footer/Footer";
import { useEffect, useRef } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  const container = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    container.current?.scrollTo(
      0,
      0
    );
  }, [pageProps]);

  return (
      <QueryClientProvider client={queryClient}>
        <MainContextProvider>
          <div className="h-screen max-h-screen flex flex-col">
            <div className="flex-1 sm:flex sm:flex-col sm:items-center sm:justify-center overflow-hidden">
              <div className="App relative sm:px-20 h-full py-12 w-full max-w-2xl overflow-hidden">
                <div ref={container} className="sm:rounded-lg sm:shadow-lg sm:z-[1] relative flex flex-col w-full h-full bg-white py-6 px-4 overflow-auto">
                  <Component {...pageProps} />
                </div>
              </div>
            </div>
            <Footer />
          </div>
        </MainContextProvider>
      </QueryClientProvider>
  );
}
