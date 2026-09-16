// Canonical front matter for the bucket-hosted HTML — the kicker, title, dek
// and Distill-style byline grid that sit above every story and studio.
//
// The files were written independently over months, from folders whose
// generating code is gone, so this can't be fixed at the source. It doesn't
// need to be: a census of all 156 files found one shape underneath the
// variation — 98% carry an <h1> inside a header container, 95% a dek element,
// 96% a byline, 98% a kicker — and the replacement content comes from the
// registry, not from parsing prose.
//
// Two rules keep this safe to run against files with no backup in git:
//   1. Nothing is deleted. The original kicker/dek/byline are HIDDEN
//      (data-vs-fm="hidden") and the new block is inserted alongside, so
//      reset() restores the file exactly. Only attributes are added.
//   2. The <h1> is never moved or rewritten. Registry titles disagree with the
//      rendered h1 in a third of files (line breaks, punctuation), which makes
//      the file the authority, not the registry. It's tagged and restyled in
//      place so the file's own `.masthead > h1` rules keep matching.
//
// Styling is one <style> block in <head>, not inline attributes: the injected
// nodes live inside each file's own header, so selectors like `header p` and
// `.masthead h1` still reach them and have to be outranked. Colours are
// currentColor and opacity, never literals — 14% of these files have dark-mode
// CSS and all of them have their own palette.
import { load } from 'cheerio';

export const FMM = 'data-vs-fm';

export const AUTHOR = 'Vishal Singh';
export const AFFILIATION = 'NYU Stern';
export const AUTHOR_URL = 'https://vishalsingh.org';

/**
 * One publication date for the whole corpus. The registry's createdAt is
 * ingest time, not publication — 129 stories land on 11 distinct days with 64
 * in a single cluster — and updatedAt tracks pipeline runs. Nothing here was
 * promoted before this date, so stamping it is accurate where a scraped
 * per-file date would be a confident guess. Override one file by putting a
 * publishedAt on its registry row.
 */
export const CORPUS_DATE = { iso: '2026-09-15', label: 'September 15, 2026' };

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
function dateOf(value) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value ?? ''));
  if (!m) return null;
  const [, y, mo, d] = m;
  const month = MONTHS[Number(mo) - 1];
  return month ? { iso: `${y}-${mo}-${d}`, label: `${month} ${Number(d)}, ${y}` } : null;
}

// ── Classifying the children of the header ──
// Matched on class names because that's what the corpus actually shares: the
// tag varies (p, div, d-byline), the class idiom doesn't.
const KICKER = /kicker|eyebrow|rubric/i;
const DEK = /\bdek\b|deck|subtitle|standfirst|lede|lead-in/i;
const BYLINE = /byline|authors?\b/i;
const classOf = (el, $) => `${el.tagName} ${$(el).attr('class') || ''}`;
const isKicker = (el, $) => KICKER.test(classOf(el, $));
const isDek = (el, $) => DEK.test(classOf(el, $));
const isByline = (el, $) => BYLINE.test(classOf(el, $)) || el.tagName === 'd-byline';

// ── Salvaging the old byline ──
// Most of these bylines are provenance ("Gallup World Poll, 2020 wave · 98,369
// interviews"), which belongs on the page. What they must not carry through is
// a second author or a second date contradicting the grid above them.
const LABEL = 'by|authors?|affiliations?|published|posted|updated|revised|date|data|source|dataset|corpus|sample|methods?|scope|coverage|notes?|reports?';
const DROP_CELL = new RegExp(`^(${LABEL}|vishal singh|nyu stern[^a-z]*|new york university.*|.*stern school of business)$`, 'i');
const MONTH = 'jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec';
const DATE_CELL = new RegExp(`^(published|posted|updated)?\\s*((\\d{1,2}\\s+)?(${MONTH})[a-z]*\\.?,?\\s+|(${MONTH})[a-z]*\\.?\\s+\\d{1,2},?\\s+)?\\d{4}$`, 'i');
const tidy = s => String(s ?? '').replace(/\s+/g, ' ').replace(/^[\s·|,–—-]+|[\s·|,–—-]+$/g, '').trim();

/**
 * Split a byline into the pieces its author saw as separate. Neither of the
 * obvious approaches survives this corpus on its own: .text() glues a Distill
 * label grid into "AuthorVishal SinghPublishedJuly 2026", and splitting on
 * child elements loses the values in `<b>Data</b> CDC YRBS, national files`,
 * where the label is the element and the value is a bare text node. Walking to
 * the leaves and keeping text nodes as pieces of their own handles both.
 */
function pieces(node, $) {
  const out = [];
  $(node).contents().each((_, n) => {
    if (n.type === 'text') { const t = tidy(n.data); if (t) out.push(t); }
    else if (n.type === 'tag') {
      const inner = pieces(n, $);
      if (inner.length) out.push(...inner);
      else { const t = tidy($(n).text()); if (t) out.push(t); }
    }
  });
  return out;
}

// Whatever the walker couldn't separate: a piece that still carries its own
// label ("Data CDC YRBS", "PublishedJuly 2026") is cleaned before it's judged.
// Case-sensitive on purpose: under /i the [A-Z0-9] lookahead matches lowercase
// too, and "Database" comes back as "Data base".
const CAPS = LABEL.replace(/(^|\|)([a-z])/g, (_, bar, c) => bar + c.toUpperCase());
const SPACE_LABELS = new RegExp(`\\b(${CAPS})(?=[A-Z0-9])`, 'g');
const LEAD_LABEL = new RegExp(`^(${LABEL})\\b[\\s:]*`, 'i');
// A piece that is nothing but a label ending in a colon, or that leads with
// one, is the header of a cell whose value is the next piece along.
const BARE_LABEL = /^[A-Za-z][A-Za-z /&-]{0,24}:$/;
const COLON_LABEL = /^[A-Z][A-Za-z /&-]{0,20}:\s*/;
const unlabel = s => tidy(tidy(s).replace(SPACE_LABELS, '$1 ').replace(LEAD_LABEL, '').replace(COLON_LABEL, ''));

export function sourceLine(byline, $) {
  if (!byline?.length) return '';
  const kept = pieces(byline.get(0), $).filter(c => !BARE_LABEL.test(c)).map(unlabel)
    .filter(c => c && !DROP_CELL.test(c) && !DATE_CELL.test(c));
  const line = tidy(kept.join(' · ').replace(/\s*·\s*·\s*/g, ' · '));
  return line.length >= 12 ? line : '';
}

// ── The block ──
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const cell = (label, value) =>
  `<div ${FMM}="cell"><span ${FMM}="label">${esc(label)}</span><span ${FMM}="value">${value}</span></div>`;

export function bylineBlock(published) {
  return `<div ${FMM}="byline">`
    + cell('Author', `<a href="${AUTHOR_URL}" rel="author">${esc(AUTHOR)}</a>`)
    + cell('Affiliation', esc(AFFILIATION))
    + cell('Published', `<time datetime="${published.iso}">${esc(published.label)}</time>`)
    + `</div>`;
}

// Theme-neutral by construction: no background, no colour literal, rules at a
// grey that reads on paper and on ink. The title keeps the file's own typeface
// — overriding font-family would erase what makes each story look like itself —
// and only its scale, weight and leading are normalised.
export const CSS = `[${FMM}="kicker"],[${FMM}="dek"],[${FMM}="byline"],[${FMM}="source"]{box-sizing:border-box;color:inherit}
[${FMM}="hidden"]{display:none!important}
[${FMM}="kicker"]{margin:0 0 .9rem!important;padding:0!important;font-family:var(--sans,ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif)!important;font-size:11.5px!important;font-weight:600!important;line-height:1.35!important;letter-spacing:.16em!important;text-transform:uppercase!important;opacity:.6!important}
[${FMM}="title"]{margin:0 0 .65rem!important;font-size:clamp(2rem,1.1rem + 3.4vw,3.3rem)!important;line-height:1.08!important;letter-spacing:-.018em!important;text-wrap:balance}
[${FMM}="dek"]{margin:0 0 1.4rem!important;padding:0!important;max-width:34em!important;font-size:clamp(1.02rem,.96rem + .3vw,1.2rem)!important;font-weight:400!important;line-height:1.5!important;opacity:.78!important}
[${FMM}="byline"]{display:grid!important;grid-template-columns:repeat(auto-fit,minmax(9.5rem,max-content))!important;gap:13px 34px!important;margin:0!important;padding:14px 0 0!important;border-top:1px solid rgba(128,128,128,.32)!important;border-bottom:0!important;background:none!important}
[${FMM}="cell"]{margin:0!important;padding:0!important}
[${FMM}="label"]{display:block!important;margin:0 0 3px!important;font-family:var(--sans,ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif)!important;font-size:10.5px!important;font-weight:600!important;line-height:1.4!important;letter-spacing:.14em!important;text-transform:uppercase!important;opacity:.52!important}
[${FMM}="value"]{display:block!important;font-family:var(--sans,ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif)!important;font-size:14px!important;font-weight:400!important;line-height:1.45!important;opacity:.9!important}
[${FMM}="value"] a{color:inherit!important;text-decoration:underline!important;text-underline-offset:3px!important}
[${FMM}="source"]{margin:12px 0 0!important;padding:0!important;max-width:46em!important;font-family:var(--sans,ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif)!important;font-size:12.5px!important;font-weight:400!important;line-height:1.5!important;opacity:.58!important}`;

/**
 * Undo every mark this module makes, so the transform always rebuilds from the
 * file as it was authored. Idempotence is a bucket-safety property here, not a
 * nicety: inject-chrome PUTs only when bytes differ, and a transform that
 * churned on re-application would rewrite 156 files on every pipeline run.
 */
export function reset($) {
  $(`style[${FMM}]`).remove();
  $(`[${FMM}="kicker"],[${FMM}="dek"],[${FMM}="byline"],[${FMM}="source"]`).remove();
  $(`[${FMM}]`).each((_, el) => $(el).removeAttr(FMM));
}

/**
 * Rewrite one file's front matter. `meta` is the registry row (used for the dek
 * when the file has none, and for a publishedAt override); everything else is
 * read off the page. Returns the HTML unchanged when there's no title to build
 * around — an app shell, or a fragment that never had front matter.
 */
export function applyFrontMatter(html, meta) {
  const $ = load(html);
  reset($);

  const h1 = $('h1').first();
  const host = h1.parent();
  if (!h1.length || !host.length || host.is('body, html')) return { html: $.html(), changed: false };

  // The parts are looked for among the title's own siblings first, then one
  // level out: `header.masthead > p.kicker` with the title down in a `div.wrap`
  // is a common shape here, as is `d-byline` sitting outside `d-title`.
  const pick = (pred, side) => {
    const ring = el => {
      const kids = $(el).parent().children().toArray();
      const at = kids.indexOf(el);
      return side === 'before' ? kids.slice(0, at).reverse() : kids.slice(at + 1, at + 4);
    };
    for (const el of [h1.get(0), host.get(0)]) {
      const found = ring(el).find(sibling => pred(sibling, $));
      if (found) return found;
    }
    return undefined;
  };

  const kickerEl = pick(isKicker, 'before');
  const dekEl = pick(isDek, 'after');
  const bylineEl = pick(isByline, 'after');

  const kicker = kickerEl ? tidy($(kickerEl).text()) : '';
  const dekHtml = (dekEl ? $(dekEl).html() : esc(meta?.description ?? '')) ?? '';
  const source = sourceLine(bylineEl ? $(bylineEl) : null, $);
  const published = dateOf(meta?.publishedAt) ?? CORPUS_DATE;

  for (const el of [kickerEl, dekEl, bylineEl]) if (el) $(el).attr(FMM, 'hidden');
  h1.attr(FMM, 'title');

  // Kicker above the title, everything else below it, whatever order the file
  // had them in.
  if (kicker) h1.before(`<p ${FMM}="kicker">${esc(kicker)}</p>`);
  h1.after((dekHtml.trim() ? `<p ${FMM}="dek">${dekHtml.trim()}</p>` : '')
    + bylineBlock(published)
    + (source ? `<p ${FMM}="source">${esc(source)}</p>` : ''));

  const style = `<style ${FMM}>${CSS}</style>`;
  if ($('head').length) $('head').append(style);
  else h1.parent().before(style);

  return { html: $.html(), changed: true };
}
