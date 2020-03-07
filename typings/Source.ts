const me: string = process.env.USER_ME!;
const other: string = process.env.USER!;

const sources: { [key in string]: string } = {};
sources[me] = '';
sources[other] = '';

export type Source = keyof typeof sources;
