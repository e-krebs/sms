import { CustomDate, Source, MMSContent } from ".";

interface MessageCore<T> extends CustomDate {
  type: string;
  source: Source;
  message: T;
}

export interface SMS extends MessageCore<string> {
  type: 'SMS',
}

export interface MMS extends MessageCore<MMSContent> {
  type: 'MMS',
}

export type Message = SMS | MMS;
