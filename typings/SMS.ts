import { CustomDate, Source } from ".";

export interface SMS extends CustomDate {
  type: 'SMS',
  source: Source;
  message: string;
}
