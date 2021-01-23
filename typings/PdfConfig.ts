import PDFDocument from 'pdfkit';

export interface PdfConfig {
  doc: typeof PDFDocument;
  errors: string;
  currentDate: string;
  currentTime: number;
  currentSource: string;
  nextY: number;
}
