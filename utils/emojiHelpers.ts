import emojiRegex from 'emoji-regex';

export const getEmoji = (char: string): string | null => {
  const codePoint = char.codePointAt(0);
  if (!codePoint) return null;
  const hex = codePoint.toString(16);
  return `node_modules/asturur-noto-emoji/png/128/emoji_u${hex}.png`
}

export const hasEmoji = (s: string): boolean => {
  const regex = emojiRegex();
  return regex.test(s);
}

export const splitEmoji = (input: string, shortenEmojis: boolean = false): string[] => {
  const regex = emojiRegex();
  const output: string[] = [];
  let match: RegExpExecArray | null;
  let index = 0;

  while (match = regex.exec(input)) {
    if (index != match.index) {
      // text before the emoji
      output.push(input.substring(index, match.index));
    }
    index = match.index + match[0].length;
    // the emoji
    if (shortenEmojis) {
      output.push('i');
    } else {
      output.push(input.substring(match.index, index));
    }
  }

  if (input.length > index) {
    // text after the emoji
    output.push(input.substring(index));
  }

  return output;
}

export const shortenEmojis = (input: string): string => {
  return splitEmoji(input, true).join('');
}

export const nbEmojis = (s: string): number => {
  const regex = emojiRegex();
  let nb = 0;
  while (regex.exec(s)) {
    nb++;
  }
  return nb;
}
