// https://www.npmjs.com/package/pdfkit
import dotenv from 'dotenv';
dotenv.config();

import PDFDocument from 'pdfkit';
import fs from 'fs';

import { ImageInfo, Message, MMSConfig, PdfConfig, SMSConfig } from './typings';
import { me, other, addMessage, computeNewDay, showHour, finishSms, computeHeight, computeMmsHeight, writeImage, getImageInfo } from './utils';
import { page, font } from './pdfConfig';

const main = async () => {
  const messages: Message[] = JSON.parse(fs.readFileSync('sms-clean.json').toString());

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

  // cover page
  config.doc.fontSize(font.title);
  config.doc.text(`${other} & ${me}`, { align: 'center' });
  config.doc.addPage();

  // add an empty page
  config.doc.addPage();

  // reset
  config.doc.fontSize(font.regular);

  if (fs.existsSync('tmp')) {
    fs.rmSync('tmp', { recursive: true });
  }
  fs.mkdirSync('tmp');

  for (const message of messages) {
    switch (message.type) {
      case 'SMS':
        const msgConfig: SMSConfig = {
          message,
          align: message.source === me ? 'right' : 'left',
          height: computeHeight(message.message, config.doc),
          showHour: false
        };

        computeNewDay(msgConfig, config);

        if (msgConfig.showHour) {
          showHour(msgConfig, config)
        }

        addMessage(msgConfig, config, null);

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

        computeNewDay(mmsConfig, config);

        if (mmsConfig.showHour) {
          showHour(mmsConfig, config)
        }

        addMessage(mmsConfig, config, imageInfo);

        finishSms(mmsConfig, config);

        break;
      default:
        console.log('malformed message', message);
        break;
    }
  }

  config.doc.end();

  
  if (fs.existsSync('tmp')) {
    fs.rmSync('tmp', { recursive: true });
  }

  fs.writeFileSync('errors.log', config.errors);
}

main().then(() => {
  console.log('sms.pdf file is written');
})
