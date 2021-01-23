import { SMS } from ".";

export interface SMSConfig {
  message: SMS;
  align: 'right' | 'left' | 'center';
  height: number;
  showHour: boolean;
}