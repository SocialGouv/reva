import { heightConfig } from "../Card/view";

interface CardSkeletonProps {
  size?: "small" | "medium" | "large";
}

export const CardSkeleton = ({ size = "small" }: CardSkeletonProps) => {
  const isSmall = size === "small";
  const isMedium = size === "medium";
  const isFullscreen = size === "large";
  const imgSize = isSmall ? "105px" : isMedium ? "240px" : "174px";
  const titleSkeleton = (width: number) => (
    <div
      className="rounded-full mb-3 h-6 bg-slate-700"
      style={{ width: `${width}px` }}
    ></div>
  );

  return (
    <li
      style={{
        height: size === "small" ? heightConfig.small : heightConfig.medium,
      }}
    >
      <div className="relative h-full rounded-2xl overflow-hidden pt-4 px-6 shadow-2xl bg-slate-900 text-white">
        <div className="animate-pulse w-full h-full flex flex-col items-end">
          <div
            className="rounded-full bg-slate-700 absolute left-[-43px]"
            style={{
              top: isFullscreen ? "auto" : "15px",
              bottom: isFullscreen ? "145px" : "auto",
              width: imgSize,
              height: imgSize,
            }}
          />
          <div className="rounded-full w-10 absolute top-6 right-4 bg-slate-700 h-4"></div>
          <div className="grow w-full flex flex-col justify-end pb-6">
            {titleSkeleton(190)}
            {titleSkeleton(250)}
          </div>
        </div>
      </div>
    </li>
  );
};
