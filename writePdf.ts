// https://www.npmjs.com/package/pdfkit
import dotenv from 'dotenv';
dotenv.config();

import PDFDocument from 'pdfkit';
import fs from 'fs';

import { Message, PdfConfig, SMSConfig } from './typings';
import { me, other, addMessage, computeNewDay, showHour, finishSms } from './utils';
import { page, font, textWidth } from './pdfConfig';

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

config.doc.pipe(fs.createWriteStream('sms.pdf'));
config.doc.font('fonts/NotoSans-ExtraLight.ttf');

config.doc.fontSize(font.title);
config.doc.text(`${other} & ${me}`, { align: 'center' });
config.doc.addPage();

// add an empty page
config.doc.addPage();

// reset
config.doc.fontSize(font.regular);

for (const message of messages) {
  switch (message.type) {
    case 'SMS':
      const msgConfig: SMSConfig = {
        message,
        align: message.source === me ? 'right' : 'left',
        height: config.doc.heightOfString(message.message, { width: textWidth }),
        showHour: false
      };

      computeNewDay(msgConfig, config);

      if (msgConfig.showHour) {
        showHour(msgConfig, config)
      }

      addMessage(msgConfig, config);

      finishSms(msgConfig, config);
      break;
    case 'MMS':
      console.log('TODO: mms');
      break;
    default:
      console.log('malformed message', message);
      break;
  }
}

config.doc.end();

fs.writeFileSync('errors.log', config.errors);
