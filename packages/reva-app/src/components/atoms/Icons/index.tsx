import { CSSProperties, SVGProps } from "react";

const defaultLineStyle: CSSProperties = {
  fill: "none",
  stroke: "#000000",
  strokeLinecap: "round",
  strokeLinejoin: "round",
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
