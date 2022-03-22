import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import { Header } from "../components/atoms/Header";
import { Loader } from "../components/atoms/Icons";
import { BackButton } from "../components/molecules/BackButton";
import certificateImg from "../components/organisms/Card/certificate.png";
import { Navigation, Page } from "../components/organisms/Page";
import { Certificate } from "../interface";

interface ProjectHome {
  certificate: Certificate;
  navigation: Navigation;
  setNavigationNext: (page: Page) => void;
  setNavigationPrevious: (page: Page) => void;
}

export const ProjectHome = ({
  certificate,
  navigation,
  setNavigationNext,
  setNavigationPrevious,
}: ProjectHome) => {
  const [homeLoaded, setHomeLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHomeLoaded(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const loadingScreen = (
    <motion.div
      key="loading-screen"
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="absolute flex flex-col bg-neutral-100 h-full"
    >
      <div className="grow flex flex-col text-center items-center justify-center">
        <Header label="Création de votre candidature" size="small" />
        <div className="mt-8 w-8">
          <Loader />
        </div>
      </div>
    </motion.div>
  );

  const homeContent = (
    <>
      <Header color="dark" label={certificate.label} size="small" />
      <div className="-mt-2 mb-2 font-bold">{certificate.codeRncp}</div>
      <p className="text-sm text-gray-450">Démarré le 10 janvier 2022</p>
      <div
        className="mt-10 flex flex-col px-8 py-6 rounded-xl bg-white shadow-sm"
        style={{ height: "414px" }}
      >
        <h3 className="mt-4 text-xl text-slate-800 font-bold">Mon Projet</h3>
        <p className="mt-4 text-sm text-gray-450 leading-loose">
          La prochaine étape consiste à définir votre projet (10 min). Vous
          pourrez vous faire accompagner par l'accompagnateur de votre choix.
        </p>
        <div className="grow flex items-end mt-6 font-bold text-blue-600">
          Bientôt disponible
        </div>
      </div>
    </>
  );

  const homeScreen = (
    <motion.div
      key="home-screen"
      className="flex flex-col h-full relative overflow-hidden"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
    >
      <img
        className="pointer-events-none"
        style={{
          position: "absolute",
          left: "-53px",
          top: "99px",
          width: "106px",
        }}
        src={certificateImg}
      />
      <div className="mt-12 text-center font-bold">REVA</div>
      <BackButton onClick={() => setNavigationPrevious("show-results")} />
      <div className="grow overflow-y-auto mt-8 px-8 pb-8">{homeContent}</div>
    </motion.div>
  );

  return (
    <Page className="z-50 flex flex-col bg-neutral-100" navigation={navigation}>
      <AnimatePresence>
        {!homeLoaded && loadingScreen} {homeLoaded && homeScreen}
      </AnimatePresence>
    </Page>
  );
};
