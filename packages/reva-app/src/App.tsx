import { Capacitor } from "@capacitor/core";
import { StatusBar } from "@capacitor/status-bar";
import { AnimatePresence } from "framer-motion";
import parse from "html-react-parser";
import { Maybe, Nothing } from "purify-ts/Maybe";
import { useEffect, useState } from "react";

import { Button } from "./components/atoms/Button";
import { BackButton } from "./components/molecules/BackButton";
import { Navigation, Page } from "./components/organisms/Page";
import { demoDescription } from "./fixtures/certificates";
import { Certificate } from "./interface";
import { Certificates } from "./pages/Certificates";
import { ProjectHome } from "./pages/ProjectHome";

function App() {
  const initialPage = "show-results";
  const initialNavigation: Navigation = {
    direction: "next",
    page: initialPage,
  };
  const [navigation, setNavigation] = useState<Navigation>(initialNavigation);

  function setNavigationNext(nextPage: Page) {
    setNavigation({ direction: "next", page: nextPage });
  }

  function setNavigationPrevious(previousPage: Page) {
    setNavigation({ direction: "previous", page: previousPage });
  }

  const [maybeCurrentCertificate, setCurrentCertificate] =
    useState<Maybe<Certificate>>(Nothing);

  useEffect(() => {
    async function setStatusBarVisibility() {
      if (
        ["show-results", "show-certificate-details"].includes(
          navigation.page
        ) &&
        maybeCurrentCertificate.isJust()
      ) {
        await StatusBar.hide();
      } else {
        await StatusBar.show();
      }
    }
    Capacitor.isNativePlatform() && setStatusBarVisibility();
  }, [navigation.page, maybeCurrentCertificate]);

  /** Pages */

  const certificateDetailsPage = (
    <Page
      key="show-certificate-details"
      className="flex flex-col z-50 bg-slate-900 pt-6"
      navigation={navigation}
    >
      <BackButton
        color="light"
        onClick={() => setNavigationPrevious("show-results")}
      />
      <div className="grow overflow-y-scroll">
        <div className="prose prose-invert prose-h2:my-1 mt-8 text-slate-400 text-base leading-normal px-8 pb-8">
          {maybeCurrentCertificate.mapOrDefault(
            (certificate) => parse(certificate.description || demoDescription),
            <></>
          )}
          <Button
            onClick={() => setNavigationNext("project-home")}
            label="Candidater"
            className="mt-8 w-full"
            primary
            size="medium"
          />
        </div>
      </div>
    </Page>
  );

  const certificatesPage = (
    <Certificates
      key="show-results"
      maybeCurrentCertificate={maybeCurrentCertificate}
      navigation={navigation}
      setNavigationNext={setNavigationNext}
      setCurrentCertificate={setCurrentCertificate}
    />
  );

  const projectHomePage = (certificate: Certificate) => (
    <ProjectHome
      key="project-home"
      certificate={certificate}
      navigation={navigation}
      setNavigationPrevious={setNavigationPrevious}
      setNavigationNext={setNavigationNext}
    />
  );

  return (
    <div className="App relative flex flex-col items-center justify-center h-screen bg-gray-400">
      {Capacitor.isNativePlatform() ? (
        <div
          className={`transition-opacity duration-200 ${
            maybeCurrentCertificate.isJust() ? "opacity-0" : "opacity-1"
          } absolute z-50 h-12 top-0 inset-x-0 backdrop-blur-md bg-white/50`}
        ></div>
      ) : (
        <></>
      )}
      <div
        className="relative flex flex-col w-full h-screen bg-white overflow-hidden"
        style={{ maxWidth: "416px" }}
      >
        <AnimatePresence custom={navigation.direction} initial={false}>
          {navigation.page === "show-results"
            ? certificatesPage
            : navigation.page === "project-home"
            ? maybeCurrentCertificate.mapOrDefault(
                projectHomePage,
                certificatesPage
              )
            : certificateDetailsPage}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
