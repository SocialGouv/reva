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

const boldLineStyle: CSSProperties = {
  ...lineStyle,
  strokeWidth: "2px",
};

export const SearchIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" {...props}>
    <g transform="matrix(3.4285714285714284,0,0,3.4285714285714284,0,0)">
      <g>
        <circle cx="5.92" cy="5.92" r="5.42" style={lineStyle}></circle>
        <line x1="13.5" y1="13.5" x2="9.75" y2="9.75" style={lineStyle}></line>
      </g>
    </g>
  </svg>
);

export const Loader = (props: SVGProps<SVGSVGElement>) => (
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

export const Back = (props: SVGProps<SVGSVGElement>) => (
  <svg
    className="stroke-current"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    {...props}
  >
    <g transform="matrix(2,0,0,2,0,0)">
      <polyline style={boldLineStyle} points="6 4.498 0.75 9.748 6 14.998" />
      <path style={boldLineStyle} d="M.75,9.748h21a1.5,1.5,0,0,1,1.5,1.5v9" />
    </g>
  </svg>
);

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
