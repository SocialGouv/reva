import { CSSProperties, SVGProps } from "react";

const lineStyle: CSSProperties = {
  fill: "none",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  strokeWidth: "1px",
};

const semiboldLineStyle: CSSProperties = {
  ...lineStyle,
  strokeWidth: "1.5px",
};

export const DefaultLoader = (props: SVGProps<SVGSVGElement>) => (
  <svg
    className="animate-spin-slow stroke-current"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    {...props}
  >
    <g transform="scale(2)">
      <path
        style={semiboldLineStyle}
        d="M12 .747v3.75M12 23.247v-3.75M4.045 4.042l2.652 2.652M19.955 19.952l-2.652-2.651M.75 11.997H4.5M23.25 11.997H19.5M4.045 19.952l2.652-2.651M19.955 4.042l-2.652 2.652"
      />
    </g>
  </svg>
);
