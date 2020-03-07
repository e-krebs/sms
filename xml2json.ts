import fs from 'fs';
import { xml2json } from 'xml-js';

const input = fs.readFileSync('sms.xml').toString();

const output = xml2json(input, {
  compact: true,
  spaces: 2,
  attributesKey: 'attributes'
});

fs.writeFileSync('sms.json', output);
