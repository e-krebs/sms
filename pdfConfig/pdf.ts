import { font } from "./generic";

export const page = {  // A4
  width: 595.28,
  height: 841.89,
  margin: 72
};

export const emojiWidth = font.regular;

export const textMargin = { x: 8, y: 5 };
export const boxLeftMargin = (page.width - page.margin * 2) / 3;
export const textWidth = (page.width - page.margin * 2) * 2 / 3 - 2 * textMargin.x;
export const pageBottom = page.height - page.margin;
