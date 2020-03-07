import { MMS, Source, MMSPart, getMessage } from "../typings";
import { getSource } from "./getSource";
import { getDate } from "./getDate";

const getParts = (msg: { [key in string]: any })
  : { parts: MMSPart[] } => {
  const parts: MMSPart[] = [];

  const partsList: any[] = msg.parts.part.map((x: any) => x.attributes);
  for (const part of partsList) {
    const text = part.text ?? undefined;
    const data = part.data ?? undefined;
    let name = part.cl !== 'smil.xml' ? part.cl : undefined;

    parts.push({
      id: parseInt(part.seq),
      contentType: part.ct,
      name,
      text,
      data
    });
  }
  return { parts };
}

export const getMMS: getMessage
  = (msg: { [key in string]: any }, phone: string)
    : MMS | undefined => {

      let message = msg.attributes;

      const types = msg.addrs.addr.filter((x: any) => x.attributes.address.indexOf(phone) > 0);

    if (types.length <= 0) return;

    let source: Source | undefined = getSource(msg, 'mms');
    if (!source) return;

    return {
      ...getDate(message),
      ...getParts(msg),
      source
    };
  };
