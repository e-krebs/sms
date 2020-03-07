import { CustomDate, Source } from ".";

export interface SMS extends CustomDate {
  source: Source;
  msg: string;
}
