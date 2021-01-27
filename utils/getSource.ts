import { Source } from "../typings";

export const me: string = process.env.USER_ME!;
export const other: string = process.env.USER_OTHER!;

export const getSource = (
  msg: { [key in string]: any },
  msgType: 'sms' | 'mms',
  phone: string
): Source | undefined => {

  let type: string | undefined;
  switch (msgType) {
    case 'sms':
      type = msg.type;
      break;
    case 'mms':
      type = msg.addrs.addr.map((x: any) => x.attributes).filter(
        (x: any) => x.address.indexOf(phone) >= 0
      )[0].type;
      break;
  }

  switch (type) {
    case '1':
    case '137':
      return other;
    case '2':
    case '151':
      return me;
    default:
      console.log(`no source found, ignoring ${msgType}`, type);
      return;
  }
}
