import fs from 'fs';

import { ImageInfo } from '../typings';
import { gm } from './gm';
import { resizeImage } from './mmsHelper';

const wait = async (): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => { resolve(); }, 1000);
  });
}

export const circleImage = async (inputImageInfo: ImageInfo): Promise<ImageInfo | null> => {
  let size: number = Math.round(inputImageInfo.width);
  if (size % 2 === 0) {
    size += 1;
  }
  let imageInfo: ImageInfo = {
    path: `tmp/${inputImageInfo.path}`,
    width: size,
    height: size
  };
  let finalImageInfo: ImageInfo = {
    path: `tmp/circle_${inputImageInfo.path}`,
    width: size,
    height: size
  };
  const halfSize = Math.round(size / 2) - 1;
  fs.copyFileSync(inputImageInfo.path, imageInfo.path);

  await resizeImage(imageInfo);
  await wait();

  /*
  convert -size 285x285 xc:none -fill .\other.jpg -draw "circle 143,143 143,1" .\other_circle.png
  */
  return new Promise((resolve) => {
    gm(size, size).command('convert')
      .in('xc:none')
      .in('-fill', imageInfo.path)
      .in('-draw', `circle ${halfSize},${halfSize} ${halfSize},1`)
      .write(finalImageInfo.path, (err) => {
        if (err) {
          console.log(`\n🛑 ${finalImageInfo.path} error when circling image`, err);
          resolve(null);
        }
        resolve(finalImageInfo);
      });
  });
};
