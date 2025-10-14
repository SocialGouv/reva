import { Footer } from "@/components/footer/Footer";

import { PublicHeader } from "../public-header/PublicHeader";

export const AuthLoader = () => (
  <div className="flex flex-col min-h-screen justify-between">
    <PublicHeader />
    <Footer />
  </div>
);
