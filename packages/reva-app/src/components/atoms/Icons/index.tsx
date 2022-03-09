import { CSSProperties, SVGProps } from "react";

const defaultLineStyle: CSSProperties = {
  fill: "none",
  stroke: "#000000",
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

const lightLineStyle: CSSProperties = {
  ...defaultLineStyle,
  stroke: "#fff",
  strokeWidth: "2.5px",
};

export const SearchIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" {...props}>
    <g transform="matrix(3.4285714285714284,0,0,3.4285714285714284,0,0)">
      <g>
        <circle cx="5.92" cy="5.92" r="5.42" style={defaultLineStyle}></circle>
        <line
          x1="13.5"
          y1="13.5"
          x2="9.75"
          y2="9.75"
          style={defaultLineStyle}
        ></line>
      </g>
    </g>
  </svg>
);

export const Add = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" {...props}>
    <g transform="matrix(2,0,0,2,0,0)">
      <line style={lightLineStyle} x1={0.75} y1={12} x2={23.25} y2={12} />
      <line style={lightLineStyle} x1={12} y1={0.75} x2={12} y2={23.25} />
    </g>
  </svg>
);
