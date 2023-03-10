import { FC, ReactNode } from "react";

import { PageHeaders } from "../../../components/molecules/PageHeaders";
import certificationImg from "../../../components/organisms/Card/certification.png";
import { Certification } from "../../../interface";
import { Page } from "../Page";

interface Props {
  certification: Certification;
  candidacyCreatedAt?: Date;
  direction: "initial" | "next" | "previous";
  children?: ReactNode;
}

export const PageWithBackground: FC<Props> = ({
  certification,
  candidacyCreatedAt,
  direction,
  children,
}) => {
  return (
    <Page
      className="relative flex flex-col bg-neutral-100 overflow-hidden w-full !max-w-none"
      direction={direction}
    >
      <img
        className="pointer-events-none"
        alt=""
        role="presentation"
        style={{
          position: "absolute",
          left: "-53px",
          top: "58px",
          width: "106px",
        }}
        src={certificationImg}
      />
      <h1 className="mt-12 -mb-12 text-center font-bold">Reva</h1>
      <div className="grow overflow-y-auto mt-36 px-12 pb-8">
        <PageHeaders
          codeRncp={certification.codeRncp}
          title={certification.label}
          candidacyCreatedAt={candidacyCreatedAt}
        />
        {children}
      </div>
    </Page>
  );
};
