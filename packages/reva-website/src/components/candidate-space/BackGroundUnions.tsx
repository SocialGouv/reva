import Image from "next/image";

const BackGroundUnions = ({ double = true }: { double?: boolean }) => (
  <div className="absolute -z-10 w-full">
    <div className="hidden lg:block overflow-hidden">
      <Image
        src="/candidate-space/unions-background/union-background1.svg"
        width={3576}
        height={990}
        style={{ width: "3576px", height: "990px" }}
        className="object-none"
        alt="rayon rose en fond d'écran"
      />
    </div>
    {double && (
      <div className="relative top-[90px] hidden lg:block overflow-hidden">
        <Image
          src="/candidate-space/unions-background/union-background2.svg"
          width={3576}
          height={774}
          style={{ width: "3576px", height: "774px" }}
          className="object-none"
          alt="rayon rose en fond d'écran"
        />
      </div>
    )}
  </div>
);

export default BackGroundUnions;
