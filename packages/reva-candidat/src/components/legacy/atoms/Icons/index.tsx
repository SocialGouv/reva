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
    aria-hidden="true"
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

export const Edit = (props: SVGProps<SVGSVGElement>) => (
  <svg
    className="stroke-current"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    {...props}
  >
    <g transform="matrix(2,0,0,2,0,0)">
      <path
        style={semiboldLineStyle}
        d="M22.19,1.81a3.638,3.638,0,0,0-5.169.035l-14.5,14.5L.75,23.25l6.905-1.771,14.5-14.5A3.638,3.638,0,0,0,22.19,1.81Z"
      />
      <line
        style={semiboldLineStyle}
        x1={16.606}
        y1={2.26}
        x2={21.74}
        y2={7.394}
      />
      <line
        style={semiboldLineStyle}
        x1={14.512}
        y1={4.354}
        x2={19.646}
        y2={9.488}
      />
      <line
        style={semiboldLineStyle}
        x1={2.521}
        y1={16.345}
        x2={7.66}
        y2={21.474}
      />
    </g>
  </svg>
);

export const Locked = (props: SVGProps<SVGSVGElement>) => (
  <svg
    className="stroke-current"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 48 48"
    {...props}
  >
    <g transform="matrix(2,0,0,2,0,0)">
      <path
        style={semiboldLineStyle}
        d="M18.75 9.75H5.25C4.42157 9.75 3.75 10.4216 3.75 11.25V21.75C3.75 22.5784 4.42157 23.25 5.25 23.25H18.75C19.5784 23.25 20.25 22.5784 20.25 21.75V11.25C20.25 10.4216 19.5784 9.75 18.75 9.75Z"
      />
      <path
        style={semiboldLineStyle}
        d="M6.75 9.75V6C6.75 4.60761 7.30312 3.27226 8.28769 2.28769C9.27226 1.30312 10.6076 0.75 12 0.75C13.3924 0.75 14.7277 1.30312 15.7123 2.28769C16.6969 3.27226 17.25 4.60761 17.25 6V9.75"
      />
      <path
        style={semiboldLineStyle}
        d="M12 16.5C11.7929 16.5 11.625 16.3321 11.625 16.125C11.625 15.9179 11.7929 15.75 12 15.75"
      />
      <path
        style={semiboldLineStyle}
        d="M12 16.5C12.2071 16.5 12.375 16.3321 12.375 16.125C12.375 15.9179 12.2071 15.75 12 15.75"
      />
    </g>
  </svg>
);
