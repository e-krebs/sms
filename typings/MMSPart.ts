interface MMSPartText {
  id: number;
  contentType: string;
  name?: string;
  text: string;
}

interface MMSPartData {
  id: number;
  contentType: string;
  name?: string;
  data: string;
}

export type MMSPart = MMSPartText | MMSPartData;
