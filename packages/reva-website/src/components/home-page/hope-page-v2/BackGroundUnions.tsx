import Image from "next/image";

const BackGroundUnions = () => (
  <>
    <div className="absolute -z-10 w-full top-32 lg:-top-[60px] hidden lg:block">
      <Image
        src="/home-page/unions-background/union-background1.svg"
        width={3000}
        height={1074}
        style={{ width: "100%" }}
        alt="rayon rose en fond d'écran"
      />
    </div>
    <div className="absolute -z-10 w-full top-[1150px] hidden lg:block">
      <Image
        src="/home-page/unions-background/union-background2.svg"
        width={2158}
        height={586}
        style={{ width: "100%", height: "586px" }}
        alt="rayon rose en fond d'écran"
      />
    </div>
  </>
);

export default BackGroundUnions;
