import fs from 'fs';

import { ImageInfo } from '../typings';
import { gm } from './gm';
import { resizeImage } from './mmsHelper';

export const circleImage = async (inputImageInfo: ImageInfo): Promise<ImageInfo | null> => {
  const imageInfo: ImageInfo = {
    path: `tmp/${inputImageInfo.path}`,
    width: Math.round(inputImageInfo.width),
    height: Math.round(inputImageInfo.height)
  };
  const halfSize = Math.round(inputImageInfo.width / 2);

  fs.copyFileSync(inputImageInfo.path, imageInfo.path);


  await resizeImage(imageInfo);

  /*
  convert -size 285x285 xc:none -fill .\other.jpg -draw "circle 143,143 143,1" .\other_circle.png
  */
  return new Promise((resolve) => {
    gm(imageInfo.width, imageInfo.height).command('convert')
      .in('xc:none')
      .in('-fill', imageInfo.path)
      .in('-draw', `circle ${halfSize},${halfSize} ${halfSize},1`)
      .write(imageInfo.path, (err) => {
        if (err) {
          console.log(`\n🛑 ${imageInfo.path} error when circling image`, err);
          resolve(null);
        }
        resolve(imageInfo);
      });
  });
};
