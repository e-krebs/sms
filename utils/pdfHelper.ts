import PDFDocument from 'pdfkit';

import { Message, MessageConfig, PdfConfig } from "../typings";
import { font, defaultColor, space, page, textMargin, textWidth } from "../pdfConfig";
import { shortenEmojis } from './emojiHelpers';
import { addPage } from './addPage';

export const heightOfString = (doc: typeof PDFDocument, string: string = 'fl', options?: any): number => {
  return Math.round(doc.heightOfString(string, options) * 10) / 10;
}

const dealWithPageOverflow = async <T extends Message>(
  msgConfig: MessageConfig<T>,
  config: PdfConfig
) => {
  // dealing with page overflow (including the message box)
  const hourHeight = config.doc.currentLineHeight(true);
  if (config.nextY + hourHeight + msgConfig.height + space.small + 2 * textMargin.y > page.height - page.margin) {
    config = await addPage(config);
    config.nextY = page.margin;
  }
}

export const computeNewDay = async <T extends Message>(
  msgConfig: MessageConfig<T>,
  config: PdfConfig
) => {
  // new day
  if (msgConfig.message.date !== config.currentDate) {
    msgConfig.showHour = false;
    config.nextY += space.small;
    await dealWithPageOverflow(msgConfig, config);
    config.doc
      .fontSize(font.small)
      .fillColor(defaultColor)
      .text(`${msgConfig.message.date} · ${msgConfig.message.hour}`, page.margin, config.nextY, { align: 'center' })
      .fontSize(font.regular);
    config.nextY = config.doc.y + space.small;
  } else {
    msgConfig.showHour = (msgConfig.message.timestamp - config.currentTime > 2 * 60 * 1000); // 2 minutes
  }
};

export const showHour = async <T extends Message>(msgConfig: MessageConfig<T>, config: PdfConfig) => {
  await dealWithPageOverflow(msgConfig, config);
  config.doc
    .fontSize(font.small)
    .fillColor(defaultColor)
    .text(msgConfig.message.hour, page.margin, config.nextY + space.small, { align: msgConfig.align })
    .fontSize(font.regular);
  config.nextY = config.doc.y - space.tiny;
};

export const finishSms = <T extends Message>(msgConfig: MessageConfig<T>, config: PdfConfig) => {
  config.nextY = config.doc.y + textMargin.y;
  config.currentDate = msgConfig.message.date;
  config.currentTime = msgConfig.message.timestamp;
  config.currentSource = msgConfig.message.source;
}

export const computeHeight = (message: string, doc: typeof PDFDocument): number => {
  return heightOfString(doc, shortenEmojis(message), { width: textWidth });
}
