interface IImageSlice {
  imageData: Array<Array<ImageData>>;
  imageBitmap: Array<Array<ImageBitmap>>;
}

export const imageSlice = (
  imageurl: string,
  slen: number
): Promise<IImageSlice> => {
  const _imageData: Array<Array<ImageData>> = Array.from({ length: 3 }, () =>
    Array.from({ length: 3 })
  );
  const _imageBitmap: Array<Array<ImageBitmap>> = Array.from(
    { length: 3 },
    () => Array.from({ length: 3 })
  );
  return new Promise(resolve => {
    const canvas = document.createElement('canvas') as HTMLCanvasElement;
    canvas.width = slen;
    canvas.height = slen;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const img = new Image();
      img.onload = async () => {
        const min = Math.min(img.width, img.height);
        const max = Math.max(min, slen);
        for (let x = 0; x < 3; x++) {
          for (let y = 0; y < 3; y++) {
            ctx.drawImage(
              img,
              (max / 3) * x,
              (max / 3) * y,
              max / 3,
              max / 3,
              (slen / 3) * x,
              (slen / 3) * y,
              slen / 3,
              slen / 3
            );
            _imageData![x][y] = ctx.getImageData(
              (slen / 3) * x,
              (slen / 3) * y,
              slen / 3,
              slen / 3
            );
          }
        }
        /* eslint-disable no-await-in-loop */
        for (let x = 0; x < 3; x++) {
          for (let y = 0; y < 3; y++) {
            if (x !== 2 || y !== 2) {
              _imageBitmap![x][y] = await createImageBitmap(_imageData![x][y]);
            }
          }
        }

        resolve({
          imageData: _imageData,
          imageBitmap: _imageBitmap,
        });
      };
      img.src = imageurl;
    }
  });
};
