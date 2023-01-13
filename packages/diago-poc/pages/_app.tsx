import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import { MainContextProvider } from "../components/main-context/MainContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <QueryClientProvider client={queryClient}>
        <MainContextProvider>
          <Component {...pageProps} />
        </MainContextProvider>
      </QueryClientProvider>
    </ChakraProvider>
  );
}
