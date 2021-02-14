// https://www.npmjs.com/package/pdfkit
import dotenv from 'dotenv';
dotenv.config();

import PDFDocument from 'pdfkit';
import fs from 'fs';

import { ImageInfo, Message, MMSConfig, PdfConfig, SMSConfig } from './typings';
import { me, addMessage, computeNewDay, showHour, finishSms, computeHeight, computeMmsHeight, writeImage, getImageInfo, addCover, finishPdf } from './utils';
import { page, font } from './pdfConfig';

const showCover: boolean = process.env.COVER === 'true';

const main = async () => {
  if (fs.existsSync('tmp')) {
    fs.rmSync('tmp', { recursive: true });
  }
  fs.mkdirSync('tmp');

  const messages: Message[] = JSON.parse(fs.readFileSync('sms-clean.json').toString());
  const volumeNb: number = 1;

  const config: PdfConfig = {
    doc: new PDFDocument({
      size: [page.width, page.height],
      bufferPages: true
    }),
    errors: '',
    currentDate: '',
    currentTime: 0,
    currentSource: '',
    nextY: page.margin
  };

  config.doc.pipe(fs.createWriteStream('sms.pdf') as NodeJS.WritableStream);
  config.doc.font('fonts/NotoSans-ExtraLight.ttf');

  if (showCover) {
    // cover page
    await addCover(volumeNb, config);

    // add an empty page
    config.doc.addPage();
  }

  // reset
  config.doc.fontSize(font.regular);

  for (const message of messages) {
    switch (message.type) {
      case 'SMS':
        const msgConfig: SMSConfig = {
          message,
          align: message.source === me ? 'right' : 'left',
          height: computeHeight(message.message, config.doc),
          showHour: false
        };

        await computeNewDay(msgConfig, config);

        if (msgConfig.showHour) {
          await showHour(msgConfig, config)
        }

        await addMessage(msgConfig, config, null);

        finishSms(msgConfig, config);
        break;
      case 'MMS':
        let imageInfo: ImageInfo | null = null;
        if (message.message.gif) {
          imageInfo = await writeImage(message.message.gif, 'gif');
        } else if (message.message.jpeg) {
          imageInfo = await writeImage(message.message.jpeg, 'jpeg');
        } else if (message.message.png) {
          imageInfo = await writeImage(message.message.png, 'png');
        } else if (message.message.audio) {
          // TODO: get audio length ?
          imageInfo = getImageInfo('audio.png');
        }

        const mmsConfig: MMSConfig = {
          message,
          align: message.source === me ? 'right' : 'left',
          height: computeMmsHeight(message.message, imageInfo, config.doc),
          showHour: false
        };

        await computeNewDay(mmsConfig, config);

        if (mmsConfig.showHour) {
          await showHour(mmsConfig, config)
        }

        await addMessage(mmsConfig, config, imageInfo);

        finishSms(mmsConfig, config);

        break;
      default:
        console.log('malformed message', message);
        break;
    }
  }

  finishPdf(config);
}

main().then(() => {
  console.log('sms.pdf file is written');
})
