import { format } from "date-fns";
import * as locales from "date-fns/locale";

import { CustomDate } from "../typings";

const dateFormat: string = process.env.DATE_FORMAT!;
const timeFormat: string = process.env.TIME_FORMAT!;
const localeValue: string = process.env.LOCALE!;
const locale: Locale = (locales as { [key in string]: Locale })[localeValue];

export const getDate = (msg: any): CustomDate => {
  let dateObj = new Date(parseInt(msg.date));
  const date = format(dateObj, dateFormat, { locale });
  const hour = format(dateObj, timeFormat, { locale });
  const timestamp = parseInt(format(dateObj, 'T', { locale }));
  return { timestamp, date, hour };
}
