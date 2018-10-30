import { isFontLoaded } from "./FontUtils";
import LineBreaker from "@craigmorton/linebreak";
import MultiKeyCache from "multi-key-cache";

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

const _cache = new MultiKeyCache();
const _zeroMetrics = {
  width: 0,
  height: 0,
  lines: []
};

/**
 * Given a string of text, available width, and font return the measured width
 * and height.
 * @param {String} text The input string
 * @param {Number} width The available width
 * @param {FontFace} fontFace The FontFace to use
 * @param {Number} fontSize The font size in CSS pixels
 * @param {Number} lineHeight The line height in CSS pixels
 * @return {Object} Measured text size with `width` and `height` members.
 */
export default function measureText(
  text,
  width,
  fontFace,
  fontSize,
  lineHeight
) {
  const cacheKey = [text, width, fontFace.id, fontSize, lineHeight];
  const cached = _cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Bail and return zero unless we're sure the font is ready.
  if (!isFontLoaded(fontFace)) {
    return _zeroMetrics;
  }

  const measuredSize = {};
  let textMetrics;
  let lastMeasuredWidth;
  let tryLine;
  let currentLine;
  let breaker;
  let bk;
  let lastBreak;

  ctx.font =
    fontFace.attributes.style +
    " normal " +
    fontFace.attributes.weight +
    " " +
    fontSize +
    "px " +
    fontFace.family;
  textMetrics = ctx.measureText(text);

  measuredSize.width = textMetrics.width;
  measuredSize.height = lineHeight;
  measuredSize.lines = [];

  if (measuredSize.width <= width) {
    // The entire text string fits.
    measuredSize.lines.push({ width: measuredSize.width, text: text });
  } else {
    // Break into multiple lines.
    measuredSize.width = width;
    currentLine = "";
    breaker = new LineBreaker(text);

    while ((bk = breaker.nextBreak())) {
      const word = text.slice(lastBreak ? lastBreak.position : 0, bk.position);

      tryLine = currentLine + word;
      textMetrics = ctx.measureText(tryLine);
      if (textMetrics.width > width || (lastBreak && lastBreak.required)) {
        measuredSize.height += lineHeight;
        measuredSize.lines.push({
          width: lastMeasuredWidth,
          text: currentLine.trim()
        });
        currentLine = word;
        lastMeasuredWidth = ctx.measureText(currentLine.trim()).width;
      } else {
        currentLine = tryLine;
        lastMeasuredWidth = textMetrics.width;
      }

      lastBreak = bk;
    }

    currentLine = currentLine.trim();
    if (currentLine.length > 0) {
      textMetrics = ctx.measureText(currentLine);
      measuredSize.lines.push({ width: textMetrics, text: currentLine });
    }
  }

  _cache.set(cacheKey, measuredSize);

  return measuredSize;
}
