"use client";

import React from "react";

type SemiCircularProgressProps = {
  value: number; // current value
  total?: number; // max value; default 100
  segments?: number; // number of discrete segments along the arc
  radius?: number; // outer radius of the arc in px
  thickness?: number; // stroke width in px
  gapDegrees?: number; // gap between segments in degrees
  size?: number; // overall svg width/height; if omitted, derived from radius
  className?: string;
  showLabel?: boolean;
  label?: string | ((percent: number) => string);
  filledColor?: string; // gradient start color for filled segments
  filledColorEnd?: string; // gradient end color for filled segments
  emptyColor?: string; // color for empty segments
  emptyOpacity?: number; // opacity for empty segments
  variant?: 'arc' | 'exact'; // 'exact' uses provided SVG paths to match design precisely
};

function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number
): { x: number; y: number } {
  const angleRad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

function arcSegmentPath(
  cx: number,
  cy: number,
  r: number,
  fromDeg: number,
  toDeg: number
): string {
  const start = polarToCartesian(cx, cy, r, fromDeg);
  const end = polarToCartesian(cx, cy, r, toDeg);
  const largeArcFlag = toDeg - fromDeg <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
}

export default function SemiCircularProgress({
  value,
  total = 100,
  segments = 24,
  radius = 150,
  thickness = 16,
  gapDegrees = 4.5,
  size,
  className,
  showLabel = true,
  label,
  filledColor = "#EE6200",
  filledColorEnd = "#883800",
  emptyColor = "#C9CCD8",
  emptyOpacity = 0.5,
  variant = 'arc',
}: SemiCircularProgressProps) {
  const percent = Math.max(0, Math.min(100, (value / Math.max(1, total)) * 100));
  const filledSegments = Math.round((segments * percent) / 100);

  // SVG geometry
  const sweep = 180; // degrees for semicircle
  const startAngle = 180; // left side
  const innerPadding = thickness / 2 + 2; // to keep rounded caps inside viewBox
  const r = radius - innerPadding;
  const width = size ?? radius * 2 + 10;
  const height = size ? size / 2 : radius + 10;
  const cx = width / 2;
  const cy = height; // center y at bottom edge for semi-circle

  // Segment angular span minus gap
  const step = sweep / segments;
  const arcSpan = Math.max(0.01, step - gapDegrees);

  const arcGradientId = React.useId();
  const exactGradientBaseId = React.useId();

  // Exact path variant — use the provided SVG paths for each segment
  if (variant === 'exact') {
    // Ordered from left-bottom to right-bottom to match fill direction
    const exactPaths = [
      // Left/bottom-most towards right (reversed from provided SVG)
      "M0.396599 150.828C0.437224 150.261 0.480717 149.696 0.527064 149.131C0.852177 145.167 4.47056 142.374 8.4157 142.872L45.1515 147.512C48.536 147.939 50.9162 151.029 50.6723 154.432V154.432V154.432C50.4284 157.835 47.6318 160.554 44.2209 160.494L7.19889 159.847C3.22305 159.777 0.0401602 156.496 0.283605 152.527C0.318312 151.961 0.355972 151.395 0.396599 150.828Z",
      "M12.7345 121.204C8.9002 120.15 4.921 122.401 4.03912 126.278C3.78864 127.379 3.54925 128.485 3.32109 129.596C2.52072 133.491 5.21191 137.186 9.13856 137.814L45.7515 143.661C49.0935 144.194 52.2248 141.877 52.9415 138.57V138.57C53.6583 135.262 51.7486 131.928 48.4854 131.031L12.7345 121.204Z",
      "M20.1025 100.383C16.4589 98.7906 12.1979 100.448 10.7699 104.159C10.3639 105.214 9.96847 106.275 9.58385 107.342C8.23466 111.082 10.3714 115.124 14.1685 116.304L49.5922 127.318C52.8138 128.32 56.2278 126.493 57.4066 123.332V123.332C58.5853 120.171 57.184 116.594 54.0929 115.243L20.1025 100.383Z",
      "M30.3787 80.8342C27.0006 78.7362 22.5463 79.7666 20.6012 83.235C20.0477 84.222 19.5041 85.2157 18.9706 86.2158C17.0992 89.7242 18.6342 94.0305 22.2227 95.7433L55.6942 111.72C58.7427 113.175 62.3832 111.865 64.0047 108.901V108.901C65.6261 105.938 64.7556 102.184 61.8861 100.401L30.3787 80.8342Z",
      "M43.3432 62.9468C40.298 60.3895 35.7425 60.7756 33.3228 63.9313C32.6338 64.8299 31.9539 65.7361 31.2833 66.6497C28.9305 69.8552 29.8341 74.3365 33.1409 76.5447L63.9708 97.1324C66.7879 99.0136 70.5854 98.2403 72.6185 95.5308V95.5308C74.6516 92.8214 74.3269 88.9656 71.7329 86.7873L43.3432 62.9468Z",
      "M58.7183 47.0766C56.0659 44.1138 51.5017 43.851 48.6591 46.6318C47.8494 47.4239 47.0478 48.2246 46.2546 49.0336C43.4708 51.8729 43.7285 56.4371 46.6879 59.0928L74.2706 83.8442C76.7969 86.1112 80.6717 85.887 83.0732 83.4883V83.4883C85.4747 81.0897 85.7018 77.2167 83.4379 74.6879L58.7183 47.0766Z",
      "M76.1848 33.5414C73.9784 30.2331 69.4973 29.327 66.2899 31.6777C65.376 32.3474 64.4693 33.0266 63.5698 33.7151C60.4123 36.132 60.0215 40.6867 62.5753 43.7345L86.3776 72.1407C88.5576 74.7424 92.4236 75.07 95.1403 73.035V73.035C97.8568 71.0002 98.6312 67.1973 96.748 64.3736L76.1848 33.5414Z",
      "M95.3896 22.6214C93.6756 19.0331 89.3687 17.4995 85.8603 19.3714C84.8605 19.9048 83.8667 20.4485 82.8792 21.0022C79.4109 22.9471 78.3791 27.4007 80.4756 30.7794L100.022 62.2808C101.808 65.1591 105.579 66.0304 108.55 64.4045V64.4045C111.522 62.7786 112.829 59.1305 111.369 56.0741L95.3896 22.6214Z",
      "M115.948 14.5524C114.765 10.7561 110.721 8.62246 106.982 9.97455C105.916 10.3599 104.855 10.7562 103.799 11.1633C100.089 12.5938 98.4341 16.8554 100.029 20.4981L114.901 54.4761C116.256 57.5705 119.848 58.9678 123.012 57.7854V57.7854C126.176 56.6032 127.992 53.187 126.987 49.9624L115.948 14.5524Z",
      "M137.447 9.51263C136.82 5.58586 133.124 2.89438 129.23 3.69641C128.119 3.925 127.013 4.16504 125.911 4.4164C122.034 5.3005 119.786 9.2814 120.843 13.1148L130.702 48.8792C131.598 52.1315 134.939 54.0287 138.236 53.3128V53.3128C141.532 52.5969 143.827 49.4786 143.295 46.1473L137.447 9.51263Z",
      "M159.453 7.60152C159.392 3.62553 156.118 0.434701 152.149 0.671401C151.017 0.738863 149.889 0.81807 148.763 0.908908C144.8 1.22877 142.004 4.84612 142.5 8.79145L147.128 45.5809C147.55 48.9386 150.578 51.3043 153.954 51.0666V51.0666C157.329 50.8289 160.069 48.0603 160.018 44.6766L159.453 7.60152Z",
      "M181.537 8.82402C182.035 4.87894 179.241 1.26062 175.278 0.935492C174.713 0.889148 174.147 0.845656 173.581 0.805033C173.014 0.764413 172.448 0.726757 171.882 0.692055C167.913 0.44858 164.632 3.63148 164.562 7.60733L163.915 44.6318C163.855 48.0426 166.574 50.839 169.977 51.0829V51.0829V51.0829C173.379 51.3268 176.469 48.9468 176.897 45.5624L181.537 8.82402Z",
      "M203.204 13.1429C204.258 9.3087 202.007 5.32965 198.13 4.44772C197.029 4.19726 195.923 3.95789 194.813 3.72975C190.918 2.92929 187.222 5.62052 186.595 9.54726L180.748 46.1626C180.214 49.5044 182.531 52.6354 185.838 53.3522V53.3522C189.146 54.069 192.48 52.1594 193.377 48.8962L203.204 13.1429Z",
      "M224.023 20.5112C225.616 16.8677 223.959 12.6069 220.248 11.1789C219.193 10.7729 218.132 10.3775 217.066 9.9929C213.325 8.64353 209.284 10.7804 208.103 14.5777L197.09 50.0035C196.088 53.2249 197.915 56.6386 201.076 57.8174V57.8174C204.236 58.9962 207.813 57.5949 209.165 54.5037L224.023 20.5112Z",
      "M243.572 30.7879C245.67 27.4098 244.639 22.9558 241.171 21.0107C240.184 20.4572 239.191 19.9136 238.191 19.3802C234.682 17.5085 230.376 19.0436 228.663 22.6324L212.687 56.1057C211.232 59.1541 212.542 62.7942 215.505 64.4157V64.4157C218.469 66.0373 222.223 65.1667 224.005 62.297L243.572 30.7879Z",
      "M261.459 43.753C264.016 40.7079 263.63 36.1527 260.474 33.733C259.576 33.044 258.67 32.3641 257.756 31.6935C254.551 29.3404 250.069 30.2441 247.861 33.5512L227.274 64.3825C225.393 67.1995 226.166 70.9968 228.875 73.0298V73.0298C231.585 75.063 235.441 74.7383 237.619 72.1442L261.459 43.753Z",
      "M277.328 59.1289C280.291 56.4765 280.553 51.9126 277.773 49.0701C276.981 48.2603 276.18 47.4587 275.371 46.6655C272.532 43.8814 267.967 44.1391 265.312 47.0988L240.561 74.6827C238.295 77.2089 238.519 81.0834 240.917 83.4849V83.4849C243.316 85.8866 247.189 86.1137 249.718 83.8495L277.328 59.1289Z",
      "M290.863 76.5963C294.171 74.3898 295.077 69.9091 292.726 66.7017C292.057 65.7878 291.377 64.881 290.689 63.9815C288.272 60.8237 283.717 60.4328 280.669 62.9869L252.264 86.79C249.663 88.9701 249.335 92.8358 251.37 95.5525V95.5525C253.405 98.2693 257.208 99.0437 260.032 97.1602L290.863 76.5963Z",
      "M301.782 95.802C305.37 94.088 306.904 89.7814 305.032 86.2731C304.499 85.2731 303.955 84.2793 303.401 83.2916C301.456 79.8231 297.002 78.7911 293.624 80.8879L262.124 100.435C259.246 102.221 258.375 105.991 260 108.963V108.963C261.626 111.935 265.275 113.242 268.331 111.782L301.782 95.802Z",
      "M309.851 116.362C313.647 115.178 315.78 111.135 314.428 107.395C314.043 106.329 313.647 105.268 313.24 104.212C311.809 100.502 307.547 98.8469 303.904 100.442L269.929 115.315C266.834 116.669 265.437 120.261 266.619 123.426V123.426C267.802 126.59 271.218 128.406 274.443 127.4L309.851 116.362Z",
      "M314.89 137.861C318.817 137.234 321.508 133.539 320.706 129.644C320.478 128.534 320.237 127.427 319.986 126.325C319.102 122.448 315.121 120.2 311.288 121.257L275.525 131.116C272.273 132.012 270.376 135.353 271.092 138.65V138.65C271.808 141.947 274.926 144.241 278.258 143.71L314.89 137.861Z",
      "M316.801 159.868C320.777 159.807 323.968 156.533 323.731 152.564C323.664 151.432 323.584 150.304 323.493 149.178C323.174 145.214 319.556 142.419 315.611 142.915L278.824 147.542C275.466 147.965 273.1 150.993 273.338 154.369V154.369C273.576 157.745 276.344 160.485 279.728 160.433L316.801 159.868Z",
    ];

    const n = exactPaths.length;
    const fillCount = Math.round((n * percent) / 100);

    // Color helpers for gradient intensity ramp
    const hexToRgb = (hex: string) => {
      const h = hex.replace('#', '');
      const bigint = parseInt(h, 16);
      return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
    };
    const rgbToHex = (r: number, g: number, b: number) =>
      `#${[r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('')}`;
    const mix = (a: string, b: string, t: number) => {
      const ca = hexToRgb(a);
      const cb = hexToRgb(b);
      return rgbToHex(ca.r + (cb.r - ca.r) * t, ca.g + (cb.g - ca.g) * t, ca.b + (cb.b - ca.b) * t);
    };

    const gradIdFor = (i: number) => `${exactGradientBaseId}-${i}`;

    const svgWidth = 324;
    const svgHeight = 161;

    return (
      <div className={className} style={{ width: '100%', maxWidth: svgWidth }}>
        <svg
          width="100%"
          height="auto"
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          preserveAspectRatio="xMidYMid meet"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label={`Progress ${Math.round(percent)}%`}
          style={{ display: 'block' }}
        >
          <defs>
            {Array.from({ length: fillCount }).map((_, i) => {
              const t = n <= 1 ? 1 : (i + 1) / Math.max(1, fillCount);
              // Earlier segments are softer; tail segments have sharper contrast
              const startCol = mix('#FFFFFF', filledColor, 0.5 + 0.5 * t);
              const endCol = mix('#552200', filledColorEnd, 0.4 + 0.6 * t);
              return (
                <linearGradient key={`g-${i}`} id={`grad-${gradIdFor(i)}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={startCol} />
                  <stop offset="100%" stopColor={endCol} />
                </linearGradient>
              );
            })}
          </defs>

          {exactPaths.map((d, i) => {
            const isFilled = i < fillCount;
            const fill = isFilled ? `url(#grad-${gradIdFor(i)})` : emptyColor;
            const fillOpacity = isFilled ? 1 : emptyOpacity;
            return <path key={i} d={d} fill={fill} fillOpacity={fillOpacity} />;
          })}

          {showLabel && (
            <text
              x="50%"
              y="62%"
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={24}
              fontWeight={700}
              fill="#FFFFFF"
            >
              {typeof label === 'function' ? label(percent) : label ?? `${Math.round(percent)}%`}
            </text>
          )}
        </svg>
      </div>
    );
  }

  // Default arc variant
  return (
    <div className={className} style={{ width }}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={`Progress ${Math.round(percent)}%`}
      >
        <defs>
          <linearGradient id={`grad-${arcGradientId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={filledColor} />
            <stop offset="100%" stopColor={filledColorEnd} />
          </linearGradient>
        </defs>
        {Array.from({ length: segments }).map((_, i) => {
          const from = startAngle + i * step + gapDegrees / 2;
          const to = from + arcSpan;
          return (
            <path
              key={`e-${i}`}
              d={arcSegmentPath(cx, cy, r, from, to)}
              stroke={emptyColor}
              strokeOpacity={emptyOpacity}
              strokeWidth={thickness}
              strokeLinecap="round"
              fill="none"
            />
          );
        })}
        {Array.from({ length: filledSegments }).map((_, i) => {
          const from = startAngle + i * step + gapDegrees / 2;
          const to = from + arcSpan;
          return (
            <path
              key={`f-${i}`}
              d={arcSegmentPath(cx, cy, r, from, to)}
              stroke={`url(#grad-${arcGradientId})`}
              strokeWidth={thickness}
              strokeLinecap="round"
              fill="none"
            />
          );
        })}
        {showLabel && (
          <text
            x={cx}
            y={cy - thickness * 0.6}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={Math.max(12, thickness * 1.2)}
            fontWeight={600}
            fill="#FFFFFF"
          >
            {typeof label === "function" ? label(percent) : label ?? `${Math.round(percent)}%`}
          </text>
        )}
      </svg>
    </div>
  );
}


