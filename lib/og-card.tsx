import { ImageResponse } from 'next/og';
import type { CSSProperties, ReactNode } from 'react';
import { book } from '@/lib/book-toc';
import { ogImageSize } from '@/lib/share-metadata';

type OgCardInput = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  accent?: string;
  kicker?: string;
  tags?: string[];
};

const palette = {
  ink: '#111827',
  muted: '#5B6472',
  faint: '#EEF2F6',
  panel: '#FFFFFF',
  card: '#F8FAFC',
  line: '#D9E2EA',
  green: '#287D67',
  blue: '#2563A6',
  amber: '#D98E28',
  rose: '#C85B47',
};

function clampText(value: string | undefined, maxLength: number): string | undefined {
  if (!value) return undefined;
  if (value.length <= maxLength) return value;
  const clipped = value.slice(0, maxLength - 3).trim();
  const lastSpace = clipped.lastIndexOf(' ');
  const clean = lastSpace > Math.floor(maxLength * 0.6) ? clipped.slice(0, lastSpace) : clipped;
  return `${clean.trim()}...`;
}

function chip(label: string, index: number, accent: string): ReactNode {
  return (
    <div
      key={label}
      style={{
        display: 'flex',
        alignItems: 'center',
        border: `1px solid ${index === 0 ? accent : palette.line}`,
        borderRadius: 999,
        background: index === 0 ? '#FFFFFF' : palette.card,
        color: index === 0 ? accent : palette.muted,
        padding: '9px 15px',
        fontSize: 22,
        fontWeight: 700,
        letterSpacing: 0,
      }}
    >
      {label}
    </div>
  );
}

function miniBar(height: number, color: string, index: number): ReactNode {
  return (
    <div
      key={`${height}-${index}`}
      style={{
        width: 18,
        height,
        borderRadius: 5,
        background: color,
      }}
    />
  );
}

function scatterPoint(
  left: number,
  top: number,
  size: number,
  color: string,
  index: number
): ReactNode {
  return (
    <div
      key={`${left}-${top}-${index}`}
      style={{
        position: 'absolute',
        left,
        top,
        width: size,
        height: size,
        borderRadius: 999,
        background: color,
        border: '3px solid #FFFFFF',
      }}
    />
  );
}

function VisualPanel({ accent }: { accent: string }) {
  const barHeights = [34, 76, 52, 118, 88, 144, 102, 66];
  const points = [
    [38, 44, 18, palette.green],
    [94, 74, 14, palette.blue],
    [136, 42, 20, accent],
    [186, 104, 16, palette.amber],
    [70, 142, 22, palette.rose],
    [156, 162, 14, palette.green],
    [224, 56, 18, palette.blue],
    [248, 144, 20, accent],
  ] as const;

  return (
    <div
      style={{
        position: 'absolute',
        right: 72,
        top: 92,
        width: 362,
        height: 446,
        border: `1px solid ${palette.line}`,
        borderRadius: 28,
        background: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        padding: 24,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ color: palette.ink, fontSize: 24, fontWeight: 800 }}>Evidence card</div>
          <div style={{ color: palette.muted, fontSize: 16, fontWeight: 600 }}>
            factors, clusters, decisions
          </div>
        </div>
        <div
          style={{
            width: 58,
            height: 58,
            borderRadius: 16,
            background: accent,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontSize: 18,
            fontWeight: 900,
          }}
        >
          D3M
        </div>
      </div>

      <div
        style={{
          marginTop: 24,
          height: 162,
          border: `1px solid ${palette.line}`,
          borderRadius: 20,
          background: palette.card,
          display: 'flex',
          alignItems: 'flex-end',
          gap: 10,
          padding: '16px 18px',
        }}
      >
        {barHeights.map((height, index) =>
          miniBar(height, index % 3 === 0 ? accent : index % 3 === 1 ? palette.blue : palette.green, index)
        )}
      </div>

      <div
        style={{
          position: 'relative',
          marginTop: 18,
          height: 196,
          border: `1px solid ${palette.line}`,
          borderRadius: 20,
          background: '#FFFFFF',
          display: 'flex',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 28,
            right: 28,
            top: 97,
            height: 1,
            background: palette.line,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 158,
            top: 24,
            bottom: 24,
            width: 1,
            background: palette.line,
          }}
        />
        {points.map(([left, top, size, color], index) =>
          scatterPoint(left, top, size, color, index)
        )}
      </div>
    </div>
  );
}

function Pattern({ accent }: { accent: string }) {
  const lineStyle: CSSProperties = {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    background: palette.faint,
  };

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
      {[90, 162, 234, 306, 378, 450, 522].map(top => (
        <div key={top} style={{ ...lineStyle, top }} />
      ))}
      <div
        style={{
          position: 'absolute',
          right: -96,
          top: -140,
          width: 460,
          height: 460,
          borderRadius: 999,
          border: `60px solid ${accent}`,
          opacity: 0.08,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 76,
          bottom: 56,
          width: 190,
          height: 190,
          borderRadius: 999,
          border: `34px solid ${palette.green}`,
          opacity: 0.08,
        }}
      />
    </div>
  );
}

/**
 * Clean 16:10 card for GALLERY THUMBNAILS (items with no real preview image —
 * e.g. datasets). Title + type + accent, legible at small sizes. Distinct from
 * renderD3mOgImage (the busy 1.91:1 social card).
 */
const THUMB_SIZE = { width: 1000, height: 625 };
export function renderGalleryThumb({
  type,
  title,
  accent = palette.green,
  topic,
}: {
  type: string;
  title: string;
  accent?: string;
  topic?: string;
}): ImageResponse {
  const t = clampText(title, 96) ?? title;
  const titleSize = t.length > 64 ? 50 : t.length > 38 ? 62 : 74;
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#FBFCFE',
          color: palette.ink,
          padding: '66px 64px 56px',
          fontFamily: 'Inter, Arial, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 12, background: accent }} />
        <div style={{ position: 'absolute', right: -120, bottom: -170, width: 430, height: 430, borderRadius: 999, border: `56px solid ${accent}`, opacity: 0.08 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 16, height: 16, borderRadius: 999, background: accent }} />
          <div style={{ display: 'flex', color: accent, fontSize: 26, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase' }}>
            {type}
          </div>
        </div>
        <div style={{ display: 'flex', fontSize: titleSize, fontWeight: 900, lineHeight: 1.04, letterSpacing: -0.5, maxWidth: 850 }}>
          {t}
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', color: palette.muted, fontSize: 24, fontWeight: 700 }}>
            {topic || 'vishalsingh.org'}
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 62 }}>
            {[30, 50, 36, 64, 44].map((h, i) => (
              <div key={i} style={{ width: 16, height: h, borderRadius: 4, background: i % 2 ? accent : palette.line }} />
            ))}
          </div>
        </div>
      </div>
    ),
    THUMB_SIZE
  );
}

/**
 * Main-site (hub) share card — vishalsingh.org, not the book. Full-bleed hero
 * photo with the favicon glyph + name over a legibility scrim. Deliberately
 * spare (no book chrome) so it reads as a personal site card, not a chapter
 * preview; see renderD3mOgImage for the teaching/book card.
 */
export function renderHeroOgImage({ imageDataUri }: { imageDataUri: string }): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          display: 'flex',
          background: '#0f172a',
          fontFamily: 'Inter, Arial, sans-serif',
        }}
      >
        <img
          src={imageDataUri}
          width={ogImageSize.width}
          height={ogImageSize.height}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            background:
              'linear-gradient(90deg, rgba(2,6,23,0.85) 0%, rgba(2,6,23,0.45) 55%, rgba(2,6,23,0.18) 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            background: 'linear-gradient(0deg, rgba(2,6,23,0.5) 0%, rgba(2,6,23,0) 40%)',
          }}
        />

        <div style={{ position: 'absolute', left: 64, top: 56, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: '#2f6f6b',
              display: 'flex',
              alignItems: 'flex-end',
              gap: 5,
              padding: '0 10px 9px',
            }}
          >
            <div style={{ width: 7, height: 13, borderRadius: 3, background: '#f4efe4' }} />
            <div style={{ width: 7, height: 20, borderRadius: 3, background: '#f4efe4' }} />
            <div style={{ width: 7, height: 27, borderRadius: 3, background: '#f4efe4' }} />
            <div style={{ width: 7, height: 34, borderRadius: 3, background: '#e8a64d' }} />
          </div>
          <div
            style={{
              display: 'flex',
              color: 'rgba(255,255,255,0.82)',
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
            }}
          >
            vishalsingh.org
          </div>
        </div>

        <div style={{ position: 'absolute', left: 64, bottom: 66, display: 'flex', flexDirection: 'column', maxWidth: 820 }}>
          <div style={{ display: 'flex', color: '#FFFFFF', fontSize: 92, fontWeight: 800, letterSpacing: -1.5, lineHeight: 1.02 }}>
            Vishal Singh
          </div>
          <div style={{ marginTop: 18, display: 'flex', color: 'rgba(255,255,255,0.85)', fontSize: 28, fontWeight: 600 }}>
            NYU Stern · Interactive Data Gallery
          </div>
        </div>
      </div>
    ),
    ogImageSize
  );
}

export function renderD3mOgImage({
  eyebrow = 'D3M',
  title,
  subtitle = book.subtitle,
  accent = palette.green,
  kicker = book.title,
  tags = [],
}: OgCardInput): ImageResponse {
  const safeTitle = clampText(title, 92) ?? book.title;
  const longTitle = safeTitle.length > 38;
  const safeSubtitle = clampText(subtitle, longTitle ? 84 : 126);
  const safeTags = tags.slice(0, longTitle ? 2 : 3);
  const titleFontSize = safeTitle.length > 72 ? 46 : safeTitle.length > 38 ? 54 : 62;
  const subtitleFontSize = longTitle ? 22 : 27;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          display: 'flex',
          background: '#FBFCFE',
          color: palette.ink,
          overflow: 'hidden',
          fontFamily: 'Inter, Arial, sans-serif',
        }}
      >
        <Pattern accent={accent} />

        <div
          style={{
            position: 'absolute',
            left: 64,
            top: 56,
            display: 'flex',
            alignItems: 'center',
            gap: 18,
          }}
        >
          <div
            style={{
              height: 64,
              minWidth: 126,
              borderRadius: 18,
              background: palette.ink,
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 34,
              fontWeight: 900,
              letterSpacing: 0,
            }}
          >
            D3M
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ color: palette.ink, fontSize: 27, fontWeight: 800 }}>{kicker}</div>
            <div style={{ color: palette.muted, fontSize: 18, fontWeight: 600 }}>
              Visual evidence for managerial decisions
            </div>
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            left: 64,
            top: 174,
            width: 650,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 28,
            }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 999,
                background: accent,
              }}
            />
            <div
              style={{
                color: accent,
                fontSize: 21,
                fontWeight: 900,
                letterSpacing: 1.2,
                textTransform: 'uppercase',
              }}
            >
              {eyebrow}
            </div>
          </div>

          <div
            style={{
              color: palette.ink,
              fontSize: titleFontSize,
              lineHeight: 1.02,
              fontWeight: 900,
              letterSpacing: 0,
              maxWidth: 650,
            }}
          >
            {safeTitle}
          </div>

          {safeSubtitle && (
            <div
              style={{
                marginTop: longTitle ? 20 : 26,
                color: palette.muted,
                fontSize: subtitleFontSize,
                lineHeight: 1.22,
                fontWeight: 500,
                maxWidth: 620,
              }}
            >
              {safeSubtitle}
            </div>
          )}

          {safeTags.length > 0 && (
            <div style={{ marginTop: longTitle ? 18 : 34, display: 'flex', gap: 12 }}>
              {safeTags.map((tag, index) => chip(tag, index, accent))}
            </div>
          )}
        </div>

        <VisualPanel accent={accent} />

        <div
          style={{
            position: 'absolute',
            left: 64,
            right: 64,
            bottom: 42,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: `1px solid ${palette.line}`,
            paddingTop: 20,
          }}
        >
          <div style={{ color: palette.muted, fontSize: 20, fontWeight: 700 }}>
            Data Driven Decision Making
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 9, height: 9, borderRadius: 999, background: palette.green }} />
            <div style={{ width: 9, height: 9, borderRadius: 999, background: palette.blue }} />
            <div style={{ width: 9, height: 9, borderRadius: 999, background: accent }} />
          </div>
        </div>
      </div>
    ),
    ogImageSize
  );
}
