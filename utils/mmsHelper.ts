import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import sizeOf from 'image-size';
import rawGm, { SubClass } from 'gm';

import { ImageInfo, MMSContent } from '../typings';
import { computeHeight as computeSmsHeight } from './pdfHelper';
import { space, textWidth } from '../pdfConfig';

const gm: SubClass = rawGm.subClass({ imageMagick: true });
let imageNb = -1;

export const computeMmsHeight = (message: MMSContent, imageInfo: ImageInfo | null, doc: typeof PDFDocument): number => {
  let height = 0;
  if (message?.text) {
    height += computeSmsHeight(message.text, doc);
  }
  if (imageInfo) {
    height += imageInfo.height;
  }
  if (message?.text && imageInfo) {
    height += space.tiny;
  }
  return height;
}

const getFirstFrame = (path: string, width: number, height: number): Promise<string | null> => {
  return new Promise((resolve) => {
    const newPath = `tmp/${imageNb.toString().padStart(3, '0')}.png`;
    gm(path).selectFrame(0).resize(width!, height).write(
      newPath,
      (err, stdout, sdterr, cmd) => {
        if (err) {
          console.log(`\n🛑 ${path} error when getting first frame of gif`, err, stdout, sdterr, cmd);
          resolve(null);
        } else {
          resolve(newPath);
        }
      }
    );
  });
}

const resizeImage = (imageInfo: ImageInfo): Promise<ImageInfo | null> => {
  return new Promise((resolve) => {
    if (imageInfo.width <= textWidth && imageInfo.height <= textWidth) {
      resolve(imageInfo);
    }
    let width = imageInfo.width;
    let height = imageInfo.height;

    if (imageInfo.width > textWidth) {
      width = textWidth;
      height = imageInfo.height * textWidth / imageInfo.width;
    }
    if (imageInfo.height > textWidth) {
      height = textWidth;
      width = imageInfo.width * textWidth / imageInfo.height;
    }
  
    gm(path.resolve(imageInfo.path)).resize(width, height).write(
      path.resolve(imageInfo.path),
      (err) => {
        if (err) {
          console.log(`\n🛑 ${imageInfo.path} error when resizing`, err);
          resolve(null);
        } else {
          resolve({ path: imageInfo.path, width, height });
        }
      }
    );
  });
}

export const getImageInfo = (path: string): ImageInfo | null => {
  const { width, height } = sizeOf(path);
  if (width === undefined || height === undefined) {
    return null;
  }
  return { path, width, height };
}

export const writeImage = async (
  base64: string,
  type: 'jpeg' | 'png' | 'gif'
): Promise<ImageInfo | null> => {
  imageNb++;
  let path = `tmp/${imageNb.toString().padStart(3, '0')}.${type}`;
  try {
    fs.writeFileSync(path, base64, { encoding: 'base64' });

    const { width, height } = sizeOf(path);
    if (width === undefined || height === undefined) {
      return null;
    }

    if (type === 'gif') {
      const newPath = await getFirstFrame(path, width, height);
      if (newPath) {
        path = newPath;
      } else {
        return null;
      }
    }
    const imageInfo: ImageInfo = { path, width, height };
    return await resizeImage(imageInfo)
  } catch (err) {
    console.log(`\n🛑 ${path}`, err);
    return null;
  }
}
