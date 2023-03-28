import { ReactNode } from "react";
import { Footer } from "@/components/footer/Footer";
import { Header } from "@/components/header/Header";

export const MainLayout = (props: { children?: ReactNode }) => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main role="main" className="flex-1 flex flex-col">
      {props.children}
    </main>
    <Footer />
  </div>
);
