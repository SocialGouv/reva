import { DefaultHeader } from "@/components/default-header/DefaultHeader";
import { Footer } from "@/components/footer/Footer";

export const AuthLoader = () => (
  <div className="flex flex-col min-h-screen justify-between">
    <DefaultHeader />
    <Footer />
  </div>
);
