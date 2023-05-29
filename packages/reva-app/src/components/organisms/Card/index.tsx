import { Add } from "components/atoms/Icons";
import { ReactNode } from "react";
import { onKeyboardValidation } from "utils/keyboardValidationHelper";

import certificationImg from "./certification.svg";

interface CardProps {
  id: string;
  codeRncp: string;
  onClick?: () => void;
  title: string;
}

const Hexagon = ({ className }: { className: string }) => (
  <img
    className={`absolute pointer-events-none z-10 rotate-3 ${className}`}
    alt=""
    style={{
      height: "162.5px",
      width: "181.5px",
    }}
    src={certificationImg}
  />
);

const Hexagons = () => (
  <>
    <Hexagon className="top-[64px] right-[-36px]" />
    <Hexagon className="top-[142px] left-[-48px]" />
    <Hexagon className="top-[238px] right-[-26px]" />
  </>
);

const CardHeader = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-0 justify-end uppercase text-[9px] text-[#000091] font-bold">
    {children}
  </div>
);

const CardBody = ({ children }: { children: ReactNode }) => (
  <div className="relative flex-1 bg-[#282848] rounded-xl mt-1 px-4 overflow-hidden">
    <div className="relative flex flex-col space-y-3 z-20 mt-10">
      {children}
    </div>
    <div className="absolute right-4 bottom-5 z-20 flex items-center justify-center w-[40px] h-[40px] bg-[#282848] text-white border-2 border-white rounded-full">
      <Add width={18} height={18} />
    </div>
    <Hexagons />
  </div>
);

const CardFooter = ({ children }: { children: ReactNode }) => (
  <div
    className="flex flex-0 justify-center uppercase text-[9px] font-bold  min-h-[13.5px]"
    style={{ color: "#1B0D4C" }}
  >
    {children}
  </div>
);

const CardWrapper = ({
  children,
  "data-test": dataTest,
  "data-type": dataType,
  onClick,
}: {
  children: ReactNode;
  "data-test"?: string;
  "data-type"?: string;
  onClick?: () => void;
}) => (
  <div
    data-test={dataTest}
    data-type={dataType}
    className="relative h-[315px] w-[288px] flex flex-col px-5 py-1 overflow-hidden cursor-pointer"
    style={{ background: "rgba(0,0,0,0.03)" }}
    role="button"
    tabIndex={0}
    onClick={onClick}
    onKeyUp={onKeyboardValidation(onClick)}
  >
    {children}
  </div>
);

export const CardSkeleton = () => {
  const titleSkeleton = (width: number) => (
    <div
      className={`animate-pulse rounded-full bg-current`}
      style={{ width: `${width}px` }}
    ></div>
  );

  return (
    <CardWrapper data-type="card-skeleton">
      <CardHeader>
        {/* <div>CAPMR</div> */}
        {/* <div>France Compétences</div> */}
        {/* <div>17163</div> */}
        <div className="flex h-[12px]">{titleSkeleton(90)}</div>
      </CardHeader>
      <CardBody>
        <div className="uppercase text-[9px] text-[#99E164]"></div>
        <div className="flex text-white h-[20px]">{titleSkeleton(180)}</div>
        <div className="flex text-white h-[20px]">{titleSkeleton(80)}</div>
      </CardBody>

      <CardFooter>{/* <div>CNEAP / XELYA-BCCA</div> */}</CardFooter>
    </CardWrapper>
  );
};

export const Card = (props: CardProps) => {
  return (
    <CardWrapper
      data-type="card"
      data-test={`certification-select-${props.id}`}
      onClick={props.onClick}
    >
      <CardHeader>
        {/* <div>CAPMR</div> */}
        {/* <div>France Compétences</div> */}
        <div>{props.codeRncp}</div>
      </CardHeader>
      <CardBody>
        <div className="uppercase text-[9px] text-[#99E164]"></div>
        <div className="text-white text-xl font-bold">{props.title}</div>
      </CardBody>

      <CardFooter>{/* <div>CNEAP / XELYA-BCCA</div> */}</CardFooter>
    </CardWrapper>
  );
};
