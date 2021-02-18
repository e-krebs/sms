import { colorOther, font, page, textWidth } from '../pdfConfig';
import { MMS, MMSConfig, PdfConfig, Source } from '../typings';
import { addMessage, circleImage, computeMmsHeight, finishSms, me, other } from '.';

const volume: string = process.env.VOLUME ?? 'Volume';

export const addCover = async (volumeNb: number, config: PdfConfig) => {
    // cover page
    config.doc.fontSize(font.title);
    config.nextY = page.margin * 1.5;
    await addPersonToCover(other, config);
    await addPersonToCover(me, config);
    addTitleToCover(volumeNb, config);

    config.doc.addPage();
    config.nextY = page.margin;
}

const addPersonToCover = async (source: Source, config: PdfConfig): Promise<void> => {
  const ratio: number = 0.7;
  const image = await circleImage({
    path: `${source === me ? 'me' : 'other'}.png`,
    width: textWidth * ratio,
    height: textWidth * ratio
  });

  const message: MMS = {
    type: 'MMS',
    source,
    message: { text: source },
    timestamp: 0,
    date: '',
    hour: ''
  }
  const coverItemConfig: MMSConfig = {
    message,
    align: message.source === me ? 'right' : 'left',
    height: computeMmsHeight(message.message, image, config.doc),
    showHour: false,
    showNewDay: false,
  };

  await addMessage(coverItemConfig, config, image);
  finishSms(coverItemConfig, config);
}

const addTitleToCover = (volumeNb: number, config: PdfConfig) => {
  config.doc
    .fillColor(colorOther.text)
    .text(
      `${volume} ${volumeNb}`,
      page.margin,
      config.nextY + page.margin,
      { align: 'center' }
    );
}
