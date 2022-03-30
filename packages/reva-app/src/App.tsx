import { gql, useLazyQuery } from "@apollo/client";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { AnimatePresence } from "framer-motion";
import { Just, Maybe, Nothing } from "purify-ts/Maybe";
import { useEffect, useState } from "react";

import { Navigation, Page } from "./components/organisms/Page";
import { Certificate } from "./interface";
import { CertificateDetails } from "./pages/CertificateDetails";
import { Certificates } from "./pages/Certificates";
import { ProjectHome } from "./pages/ProjectHome";

const GET_CERTIFICATE = gql`
  query Certification($id: ID!) {
    getCertification(id: $id) {
      id
      label
      summary
      codeRncp
      activities
      abilities
      activityArea
      accessibleJobType
    }
  }
`;

function App() {
  const initialPage = "show-results";
  const initialNavigation: Navigation = {
    direction: "next",
    page: initialPage,
  };
  const [navigation, setNavigation] = useState<Navigation>(initialNavigation);

  const [getCertification, { data }] = useLazyQuery(GET_CERTIFICATE);

  function setNavigationNext(nextPage: Page) {
    setNavigation({ direction: "next", page: nextPage });
  }

  function setNavigationPrevious(previousPage: Page) {
    setNavigation({ direction: "previous", page: previousPage });
  }

  const [maybeCurrentCertificate, setMaybeCurrentCertificate] =
    useState<Maybe<Certificate>>(Nothing);

  const setCurrentCertificate = (maybeCertificate: Maybe<Certificate>) => {
    setMaybeCurrentCertificate(maybeCertificate);
    // For performance reason, we delay the request after the transition
    // TODO: remove the timeout and move this to a child component with cancellation support
    setTimeout(
      () =>
        maybeCertificate.map((certificate) =>
          getCertification({ variables: { id: certificate.id } })
        ),
      800
    );
  };

  useEffect(() => {
    if (data) {
      setMaybeCurrentCertificate(Just(data.getCertification));
    }
  }, [data]);

  useEffect(() => {
    async function setStatusBarOverlay() {
      await StatusBar.setOverlaysWebView({ overlay: true });
      await StatusBar.setStyle({ style: Style.Light });
    }
    Capacitor.getPlatform() === "android" && setStatusBarOverlay();
  }, []);

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
          {navigation.page === "show-results" ||
          navigation.page === "show-certificate"
            ? certificatesPage
            : navigation.page === "project-home"
            ? maybeCurrentCertificate.mapOrDefault(
                projectHomePage,
                certificatesPage
              )
            : maybeCurrentCertificate.mapOrDefault(
                (certificate) => (
                  <CertificateDetails
                    key="show-certificate-details"
                    certificate={certificate}
                    navigation={navigation}
                    setNavigationNext={setNavigationNext}
                    setNavigationPrevious={setNavigationPrevious}
                  />
                ),
                <></>
              )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
