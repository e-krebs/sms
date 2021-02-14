import { PdfConfig } from "../typings";
import { finishPdf } from "./pdfFile";

const max: number = 700;

const wait = async (): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => { resolve(); }, 2000);
  });
}

export const addPage = async (config: PdfConfig): Promise<PdfConfig> => {
  config.doc.addPage();
  const pageNb = config.doc.bufferedPageRange().count;
  if (pageNb > (max * 2 + 2)) {
    // backcover
    config.doc.addPage();

    finishPdf(config);
    await wait();

    // TODO: new pdf
    process.exit(0);
  }
  return config;
}
