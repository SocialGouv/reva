export default function Tooltip({
  children,
  tooltipText,
}: {
  children: React.ReactNode;
  tooltipText: string;
}) {
  return (
    <div className="inline-block ml-4 group font-normal">
      <div className="relative h-full opacity-0 group-hover:opacity-100">
        <div className="bg-white text-sm rounded py-1 px-4 bottom-[100%] absolute mb-2 w-screen max-w-xs sm:w-96 sm:max-w-lg shadow">
          {tooltipText}
          <svg
            className="absolute text-white h-2 ml-3 left-0 top-[100%]"
            x="0px"
            y="0px"
            viewBox="0 0 255 255"
            xmlSpace="preserve"
          >
            <polygon className="fill-white" points="0,0 127.5,127.5 255,0" />
          </svg>
        </div>
      </div>
      {children}
    </div>
  );
}
