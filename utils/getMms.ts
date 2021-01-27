import { MMS, Source, getMessage, MMSContent } from "../typings";
import { getSource } from "./getSource";
import { getDate } from "./getDate";

const getContent = (msg: { [key in string]: any })
  : { message: MMSContent } => {
  const partsList: any[] = Array.isArray(msg.parts.part)
    ? msg.parts.part.map((x: any) => x.attributes)
    : [msg.parts.part.attributes];
  let result: MMSContent = {};

  for (const part of partsList) {
    // content-type
    switch (part.ct) {
      case 'application/smil':
        break;
      case 'text/plain':
        if (part.text) result = { ...result, text: part.text };
        break;
      case 'image/gif':
        if (part.data) result = { ...result, gif: part.data };
        break;
      case 'image/jpeg':
        if (part.data) result = { ...result, jpeg: part.data }
        break;
      case 'image/png':
        if (part.data) result = { ...result, png: part.data }
        break;
      case 'audio/3gpp':
        if (part.data) result = { ...result, audio: part.data }
        break;
      default:
        console.log(`ignoring content-type`, part.ct);
        break;
    }
  }
  return { message: result };
}

export const getMMS: getMessage
  = (msg: { [key in string]: any }, phone: string)
    : MMS | undefined => {

    let message = msg.attributes;

    const types = msg.addrs.addr.filter((x: any) => x.attributes.address.indexOf(phone) > 0);

    if (types.length <= 0) return;

    let source: Source | undefined = getSource(msg, 'mms', phone);
    if (!source) return;

    return {
      type: 'MMS',
      ...getDate(message),
      ...getContent(msg),
      source
    };
  };
