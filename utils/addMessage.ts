import { splitEmoji, hasEmoji, getEmoji, nbEmojis } from './emojiHelpers';
import { textMargin, textWidth, space, emojiWidth, page, boxLeftMargin, pageBottom, colorMe, colorOther } from '../pdfConfig';
import { PdfConfig, SMSConfig } from '../typings';
import { me } from '.';

const computeMessagePosition = (
  msgConfig: SMSConfig,
  config: PdfConfig
): {
  x: number;
  y: number;
  width: number;
} => {
  const newPerson = !msgConfig.showHour && msgConfig.message.source !== config.currentSource;

  // computing text position & size
  const emojiFix = nbEmojis(msgConfig.message.message) * space.small;
  // TODO: better handle new line (width is wrong in some cases, cf. sms n°3)
  const width = Math.min(config.doc.widthOfString(msgConfig.message.message) + emojiFix, textWidth);
  const x = page.margin
    + (msgConfig.align === 'right' ? boxLeftMargin : 0)
    + (msgConfig.align === 'right' ? (textWidth - width) : 0);
  let y = config.nextY + (newPerson ? space.small : space.tiny);
  if (y + msgConfig.height + textMargin.y * 2 > pageBottom) {
    config.doc.addPage();
    y = page.margin;
  }
  return { x, y, width };
};

const splitNewline = (input: string[]): string[] => {
  if (input.length <= 1) return input;
  const output: string[] = [];
  let emojiPassed = false;
  // split by newLine after emoji
  for (let item of input) {
    if (!emojiPassed) {
      output.push(item);
      emojiPassed = hasEmoji(item);
    } else {
      while (item.indexOf('\n') > 0) {
        let newlineIndex = item.indexOf('\n');
        output.push(item.substring(0, newlineIndex) + ' ');
        item = item.substr(newlineIndex);
      }
      output.push(item);
    }
  }
  return output;
}

export const addMessage = (
  msgConfig: SMSConfig,
  config: PdfConfig
) => {
  const message: string = msgConfig.message.message;

  let color = msgConfig.message.source === me ? colorMe : colorOther;

  const { x, y, width } = computeMessagePosition(msgConfig, config);

  // showing box
  config.doc
    .roundedRect(x, y, width + 2 * textMargin.x, msgConfig.height + textMargin.y * 2, 5)
    .fill(color.bg)
    .fillColor(color.text);

  // showing text
  const splitted = splitNewline(splitEmoji(message));
  let textX = x + textMargin.x;
  let textY = y + textMargin.y;
  const startY = textY;

  let i = 0;
  for (let segment of splitted) {
    i++;
    while (i > 1 && segment.charCodeAt(0) === 10) {
      // fixing new line at the beginning
      textY += config.doc.heightOfString(' ');
      textX = x + textMargin.x;
      segment = segment.substr(1);
    }
    const textOptions = {
      width: textWidth,
      continued: i < splitted.length
    };
    if (!hasEmoji(segment)) {
      config.doc.text(segment, textX, textY, textOptions);
      textX = config.doc.x;
      textY = config.doc.y;
    } else {
      const emoji = getEmoji(segment);
      if (emoji === null) {
        config.doc.text(segment, textX, textY, textOptions);
        textX = config.doc.x;
        textY = config.doc.y;
      } else {
        // @ts-ignore
        const continuedX: number = config.doc._wrapper?.continuedX ?? 0;
        let imageX = textX + continuedX;
        let imageY = textY + space.one;
        // take into account 'new line'
        if (i < splitted.length && imageX + emojiWidth > x + width + textMargin.x) {
          // TODO: console.log(`emoji overflow page ${config.doc.bufferedPageRange().count}: ${segment}`);
          imageX = x + textMargin.x;
          imageY += config.doc.currentLineHeight(true);
        }

        try {
          // add current emoji 😁
          config.doc.image(emoji, imageX, imageY, { width: emojiWidth });

          // add empty spaces the size of the emoji
          let imageSpace = ' ';
          while (config.doc.widthOfString(imageSpace) < emojiWidth - space.tiny) {
            imageSpace += ' ';
          }
          config.doc.text(imageSpace, textX, textY, textOptions);
          textX = config.doc.x;
          textY = config.doc.y;
        } catch {
          const codePoint = segment.codePointAt(0);
          const hex = codePoint?.toString(16);
          config.errors += `error while getting emoji "${segment}" with codePoint ${codePoint} & hex ${hex} in:\n`;
          config.errors += `${message}\n`;

          config.doc.text(segment, textX, textY, textOptions);
          textX = config.doc.x;
          textY = config.doc.y;
        }
      }
    }
    if (segment.charCodeAt(segment.length - 1) === 10) {
      // fixing new line at the end
      textY += config.doc.heightOfString(' ');
      textX = x + textMargin.x;
    }
  }
  const heightError = startY + msgConfig.height - config.doc.y;
  const allowedError = 0.1;
  if (heightError > allowedError && splitted.length > 1) {
    console.log(`   height error: ${heightError}, page: ${config.doc.bufferedPageRange().count}`);
    console.log('>' + message + '<');
    console.log('');
  }
}
