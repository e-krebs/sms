import { SMS, Source, getMessage } from "../typings";
import { getSource } from "./getSource";
import { getDate } from "./getDate";

export const getSMS: getMessage
  = (msg: { [key in string]: any }, phone: string)
    : SMS | undefined => {
    
    let message = msg.attributes;

    if (message.address.indexOf(phone) < 0) return;

    const source: Source | undefined = getSource(message, 'sms', phone);
    if (!source) return;

    return {
      type: 'SMS',
      ...getDate(message),
      message: message.body,
      source
    };
  }
