import { CustomDate, Source, MMSPart } from ".";

export interface MMS extends CustomDate {
  source: Source;
  parts: MMSPart[];
}
