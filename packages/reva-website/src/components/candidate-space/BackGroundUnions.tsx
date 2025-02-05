import Image from "next/image";

const BackGroundUnions = () => (
  <div className="absolute -top-8 -z-10 w-full">
    <div className="hidden lg:block">
      <Image
        src="/home-page/unions-background/union-background1.svg"
        width={3000}
        height={1074}
        style={{ width: "100%" }}
        alt="rayon rose en fond d'écran"
      />
    </div>
    <div className="top-[1190px] hidden lg:block">
      <Image
        src="/home-page/unions-background/union-background2.svg"
        width={3000}
        height={1074}
        style={{ width: "100%" }}
        alt="rayon rose en fond d'écran"
      />
    </div>
  </div>
);

export default BackGroundUnions;
