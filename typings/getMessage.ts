import { Message } from "./Message";

export type getMessage = (msg: { [key in string]: any }, phone: string) => Message | undefined;
