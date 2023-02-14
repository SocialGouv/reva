import * as React from "react";
import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import Head from "next/head";

const IndexPage = () => {
  return (
    <MainLayout>
      <Head>
        <title>Page d&aposaccueil France VAE</title>
      </Head>
      <div className="flex-1 flex justify-center mt-[10%] m-5">
        <h2>Bienvenue sur France VAE</h2>
      </div>
    </MainLayout>
  );
};

export default IndexPage;
