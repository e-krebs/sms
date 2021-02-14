import fs from 'fs';

import { PdfConfig } from "../typings";

export const finishPdf = (config: PdfConfig) => {
  
  console.log(config.doc.bufferedPageRange().count, 'pages written');
  config.doc.end();

  if (fs.existsSync('tmp')) {
    fs.rmSync('tmp', { recursive: true });
  }

  fs.writeFileSync('errors.log', config.errors);
}
