import { ImageResponse } from 'next/og';

/**
 * Apple touch icon (home-screen). The `apple-icon` file convention only
 * supports raster formats, so we render the same brand mark as the SVG
 * favicon (app/icon.svg) to a PNG: an ascending "data → decision" bar chart,
 * cream bars on brand teal with the outcome bar in brand amber. Full-bleed,
 * no rounded corners — iOS masks the icon itself.
 */
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

const CREAM = '#f4efe4';
const AMBER = '#e8a64d';

function bar(height: number, color: string) {
  return { width: 23, height, background: color, borderRadius: 8 } as const;
}

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#2f6f6b',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap: 15,
          paddingBottom: 34,
        }}
      >
        <div style={bar(40, CREAM)} />
        <div style={bar(62, CREAM)} />
        <div style={bar(85, CREAM)} />
        <div style={bar(113, AMBER)} />
      </div>
    ),
    size,
  );
}
