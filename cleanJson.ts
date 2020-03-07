import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';

import { Message, getMessage } from './typings';
import { getSMS, getMMS } from './utils';

const file = JSON.parse(fs.readFileSync('sms.json').toString());

interface MessagesInfo {
  rawMessages: { [key in string]: any }[];
  getMessage: getMessage;
  limit: number
}

const infos: MessagesInfo[] = [{
  rawMessages: file.smses.sms,
  getMessage: getSMS,
  limit: parseInt(process.env.LIMIT_SMS!)
}, {
  rawMessages: file.smses.mms,
  getMessage: getMMS,
  limit: parseInt(process.env.LIMIT_MMS!)
}];

const messages: Message[] = [];
let keep: number = 0;
let ignore: number = 0;

for (const { rawMessages, getMessage, limit } of infos) {
  for (const rawMessage of rawMessages) {
    if (keep >= limit) continue;

    const message: Message | undefined = getMessage(rawMessage, process.env.PHONE!);
    if (!message) {
      ignore++;
    } else {
      messages.push(message);
      keep++
    }
  }
}

messages.sort((x, y) => x.timestamp - y.timestamp);

console.log(`${keep} messages kept.`);
console.log(`${ignore} messages ignored.`);

fs.writeFileSync('sms-clean.json', JSON.stringify(messages, null, 2));

process.exit(0);
