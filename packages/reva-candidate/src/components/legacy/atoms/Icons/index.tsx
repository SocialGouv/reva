import { CSSProperties, SVGProps } from "react";

const lineStyle: CSSProperties = {
  fill: "none",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  strokeWidth: "1px",
};

const boldLineStyle: CSSProperties = {
  ...lineStyle,
  strokeWidth: "2px",
};

export const Add = (props: SVGProps<SVGSVGElement>) => (
  <svg
    className="stroke-current"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    {...props}
  >
    <g transform="matrix(2,0,0,2,0,0)">
      <line style={boldLineStyle} x1={0.75} y1={12} x2={23.25} y2={12} />
      <line style={boldLineStyle} x1={12} y1={0.75} x2={12} y2={23.25} />
    </g>
  </svg>
);
