import * as React from "react";
import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import Head from "next/head";

const IndexPage = () => {
  return (
    <MainLayout>
      <Head>
        <title>Accueil - France VAE</title>
      </Head>
      <div className="flex-1 flex justify-center mt-[10%] m-5">
        <h1>Bienvenue sur France VAE</h1>
      </div>
    </MainLayout>
  );
};

export default IndexPage;
