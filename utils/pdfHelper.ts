import { PdfConfig, SMSConfig } from "../typings";
import { font, defaultColor, space, page, textMargin } from "../pdfConfig";

export const computeNewDay = (msgConfig: SMSConfig, config: PdfConfig) => {
  // new day
  if (msgConfig.message.date !== config.currentDate) {
    msgConfig.showHour = false;
    config.nextY += space.small;
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

export const showHour = (msgConfig: SMSConfig, config: PdfConfig) => {
  // dealing with page overflow (including the message box)
  const hourHeight = config.doc.currentLineHeight(true);
  if (config.nextY + hourHeight + msgConfig.height + space.small + 2 * textMargin.y > page.height - page.margin) {
    config.doc.addPage();
    config.nextY = page.margin;
  }
  config.doc
    .fontSize(font.small)
    .fillColor(defaultColor)
    .text(msgConfig.message.hour, page.margin, config.nextY + space.small, { align: msgConfig.align })
    .fontSize(font.regular);
  config.nextY = config.doc.y - space.tiny;
};

export const finishSms = (msgConfig: SMSConfig, config: PdfConfig) => {
  config.nextY = config.doc.y + textMargin.y;
  config.currentDate = msgConfig.message.date;
  config.currentTime = msgConfig.message.timestamp;
  config.currentSource = msgConfig.message.source;
}
