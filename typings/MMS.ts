import { CustomDate, Source, MMSContent } from ".";

export interface MMS extends CustomDate {
  source: Source;
  message?: MMSContent;
}
