import { splitEmoji, hasEmoji, getEmoji, nbEmojis } from './emojiHelpers';
import { textMargin, textWidth, space, emojiWidth, page, boxLeftMargin, pageBottom, colorMe, colorOther } from '../pdfConfig';
import { ImageInfo, Message, MessageConfig, PdfConfig } from '../typings';
import { addPage, heightOfString, me } from '.';

const getText = (msgConfig: MessageConfig<Message>): string | undefined => {
  return msgConfig.message.type === 'SMS'
  ? msgConfig.message.message
  : msgConfig.message.message.text;
}

const computeMessagePosition = async (
  msgConfig: MessageConfig<any>,
  config: PdfConfig,
  imageInfo: ImageInfo | null
): Promise<{
  x: number;
  y: number;
  width: number;
}> => {
  const newPerson = !msgConfig.showHour && msgConfig.message.source !== config.currentSource;

  // computing text position & size
  const emojiFix = nbEmojis(msgConfig.message.message) * 4.7;
  const text = getText(msgConfig) ?? '';
  let width = Math.min(config.doc.widthOfString(text) + emojiFix, textWidth);
  if (imageInfo) {
    width = Math.max(width, imageInfo.width);
  }
  const x = page.margin
    + (msgConfig.align === 'right' ? boxLeftMargin : 0)
    + (msgConfig.align === 'right' ? (textWidth - width) : 0);
  let y = config.nextY + (newPerson ? space.small : space.tiny);
  if (y + msgConfig.height + textMargin.y * 2 > pageBottom) {
    config = await addPage(config);
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

export const addMessage = async (
  msgConfig: MessageConfig<Message>,
  config: PdfConfig,
  imageInfo: ImageInfo | null
) => {
  let color = msgConfig.message.source === me ? colorMe : colorOther;

  const position = await computeMessagePosition(msgConfig, config, imageInfo);
  let { x, y, width } = position;

  // showing box
  config.doc
    .roundedRect(x, y, width + 2 * textMargin.x, msgConfig.height + textMargin.y * 2, 5)
    .fill(color.bg)
    .fillColor(color.text);

  // getting text
  let message: string | undefined = getText(msgConfig);

  const startY = y + textMargin.y;

  if (imageInfo) {
    config.doc.image(imageInfo.path, x + textMargin.x, y + textMargin.y, { width: imageInfo.width, height: imageInfo.height });
    y += imageInfo.height;
    if (message) {
      y += space.tiny;
    } else {
      y += textMargin.y;
    }
    config.doc.y = y;
  }

  let textX = x + textMargin.x;
  let textY = y + textMargin.y;

  let splittedLength = imageInfo != null ? 1 : 0;

  if (message) {
  // showing text
  const splitted = splitNewline(splitEmoji(message));
    splittedLength += splitted.length;

    let i = 0;
    for (let segment of splitted) {
      i++;
      while (i > 1 && segment.charCodeAt(0) === 10) {
        // fixing new line at the beginning
        textY += heightOfString(config.doc);
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
        textY += heightOfString(config.doc);
        textX = x + textMargin.x;
      }
    }
  }
  const heightError = startY + msgConfig.height - config.doc.y;
  const allowedError = 0.1;
  if (heightError > allowedError && splittedLength > 1) {
    if (heightError < 670) { // otherwise it's just a page change
      console.log(`   height error: ${heightError}, page: ${config.doc.bufferedPageRange().count}`);
      console.log('>' + message + '<\n');
    }
  }
}
