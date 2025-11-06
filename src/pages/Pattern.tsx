import { useCallback, useEffect, useState, type ChangeEvent } from 'react';
import { NativeSelect, TextInput } from '@mantine/core';
import SidePanel from '../shared/ui/SidePanel';
const Pattern = () => {
  // Упрощённая палитра (например, 5 цветов)
  const palette = [
    { r: 255, g: 255, b: 255 }, // белый
    { r: 0, g: 0, b: 0 }, // чёрный
    { r: 255, g: 0, b: 0 }, // красный
    { r: 0, g: 255, b: 0 }, // зелёный
    { r: 0, g: 0, b: 255 }, // синий
  ];

  const [colorsNumber, setColorsNumber] = useState(2);
  const [stichesNumber, setStichesNumber] = useState(100);
  const getClosestColor = (pixelColor, palette) => {
    let minDist = Infinity;
    let closest = palette[0];
    for (const color of palette) {
      const dist = Math.sqrt(
        (pixelColor.r - color.r) ** 2 + (pixelColor.g - color.g) ** 2 + (pixelColor.b - color.b) ** 2
      );
      if (dist < minDist) {
        minDist = dist;
        closest = color;
      }
    }
    return closest;
  };
  const onInputChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files) return;
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.src = url;
      await img.decode();

      const inputCanvas = document.getElementById('input') as HTMLCanvasElement;
      const inputCtx = inputCanvas.getContext('2d');
      if (!inputCtx) return;
      const heigth = Math.round((stichesNumber * img.width) / img.height);
      inputCanvas.width = img.width;
      inputCanvas.height = heigth;
      inputCtx.drawImage(img, 0, 0, img.width, heigth);

      const imageData = inputCtx.getImageData(0, 0, img.width, heigth);

      // Обрабатываем каждый пиксель
      for (let i = 0; i < imageData.data.length; i += 4) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];
        const closest = getClosestColor({ r, g, b }, palette);
        imageData.data[i] = closest.r;
        imageData.data[i + 1] = closest.g;
        imageData.data[i + 2] = closest.b;
      }

      // Отрисовка увеличенной схемы
      const outCanvas = document.getElementById('output') as HTMLCanvasElement;
      const outCtx = outCanvas.getContext('2d');
      if (!outCtx) return;
      outCtx.putImageData(imageData, 0, 0);
      outCtx.imageSmoothingEnabled = false;
      outCtx.drawImage(outCanvas, 0, 0, outCanvas.width, outCanvas.height);
    },
    [colorsNumber, stichesNumber]
  );

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh' }}>
      <SidePanel
        onInputChange={onInputChange}
        colorsNumber={colorsNumber}
        setColorsNumber={setColorsNumber}
        stichesNumber={stichesNumber}
        setStichesNumber={setStichesNumber}
      />
      <div style={{ display: 'flex', flexDirection: 'column', padding: 20 }}>
        <input type="file" id="imageInput" accept="image/*" onChange={(e) => onInputChange(e)} />
        <canvas id="input" style={{ display: 'none' }}></canvas>
        <canvas id="output" width="100%" height="100%"></canvas>
      </div>
    </div>
  );
};

export default Pattern;
