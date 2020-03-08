import { CustomDate, Source, MMSContent } from ".";

export interface MMS extends CustomDate {
  type: 'MMS',
  source: Source;
  message?: MMSContent;
}
