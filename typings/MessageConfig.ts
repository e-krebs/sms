import { Message, MMS, SMS } from ".";

export interface MessageConfig<T extends Message> {
  message: T;
  align: 'right' | 'left' | 'center';
  height: number;
  showHour: boolean;
}

export type SMSConfig = MessageConfig<SMS>;
export type MMSConfig = MessageConfig<MMS>;
