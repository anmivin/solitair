import { useCallback, useState, type ChangeEvent } from 'react';
import 'react-cropper/node_modules/cropperjs/dist/cropper.css';
import SidePanel from '../shared/ui/SidePanel';

const Pattern = () => {
  const simplePalette = [
    // ——— Чёрно-белая основа (N=2) ———
    { name: 'black', r: 0, g: 0, b: 0 },
    { name: 'white', r: 255, g: 255, b: 255 },

    // ——— Серый (N=3) ———
    { name: 'gray', r: 128, g: 128, b: 128 },

    // ——— Основные цвета (N=6) ———
    { name: 'red', r: 255, g: 0, b: 0 },
    { name: 'lime', r: 0, g: 255, b: 0 },
    { name: 'blue', r: 0, g: 0, b: 255 },

    // ——— Вторичные (N=9) ———
    { name: 'yellow', r: 255, g: 255, b: 0 },
    { name: 'cyan', r: 0, g: 255, b: 255 },
    { name: 'magenta', r: 255, g: 0, b: 255 },

    // ——— Оттенки серого (N=12) ———
    { name: 'darkgray', r: 64, g: 64, b: 64 },
    { name: 'lightgray', r: 192, g: 192, b: 192 },
    { name: 'silver', r: 192, g: 192, b: 192 },

    // ——— Земляные и тёплые (N=18) ———
    { name: 'maroon', r: 128, g: 0, b: 0 },
    { name: 'green', r: 0, g: 128, b: 0 },
    { name: 'navy', r: 0, g: 0, b: 128 },
    { name: 'olive', r: 128, g: 128, b: 0 },
    { name: 'purple', r: 128, g: 0, b: 128 },
    { name: 'teal', r: 0, g: 128, b: 128 },

    // ——— Яркие акценты (N=24) ———
    { name: 'orange', r: 255, g: 165, b: 0 },
    { name: 'pink', r: 255, g: 192, b: 203 },
    { name: 'brown', r: 165, g: 42, b: 42 },
    { name: 'gold', r: 255, g: 215, b: 0 },
    { name: 'coral', r: 255, g: 127, b: 80 },
    { name: 'violet', r: 238, g: 130, b: 238 },

    // ——— Дополнительные нейтральные и пастельные (N=32) ———
    { name: 'beige', r: 245, g: 245, b: 220 },
    { name: 'ivory', r: 255, g: 255, b: 240 },
    { name: 'lavender', r: 230, g: 230, b: 250 },
    { name: 'turquoise', r: 64, g: 224, b: 208 },
    { name: 'indigo', r: 75, g: 0, b: 130 },
    { name: 'khaki', r: 240, g: 230, b: 140 },
    { name: 'salmon', r: 250, g: 128, b: 114 },
  ];
  const cellSize = 10;

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

  const [colsNumber, setColsNumber] = useState(0);

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

      const rows = Math.round((img.height / img.width) * stichesNumber); // сохраняем пропорции
      inputCanvas.width = stichesNumber;
      inputCanvas.height = rows;
      inputCtx.imageSmoothingEnabled = false;
      inputCtx.drawImage(img, 0, 0, stichesNumber, rows);

      const imageData = inputCtx.getImageData(0, 0, stichesNumber, rows);

      // Обрабатываем каждый пиксель
      for (let i = 0; i < imageData.data.length; i += 4) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];
        const closest = getClosestColor({ r, g, b }, simplePalette.slice(0, colorsNumber));
        imageData.data[i] = closest.r;
        imageData.data[i + 1] = closest.g;
        imageData.data[i + 2] = closest.b;
      }

      // Отрисовка увеличенной схемы
      const outCanvas = document.getElementById('output') as HTMLCanvasElement;
      const outCtx = outCanvas.getContext('2d');
      if (!outCtx) return;
      outCanvas.width = stichesNumber * cellSize;
      outCanvas.height = rows * cellSize;
      /* outCtx.putImageData(imageData, 0, 0); */
      console.log(outCanvas.width, outCanvas.height);

      outCtx.imageSmoothingEnabled = false;
      outCtx.drawImage(inputCanvas, 0, 0, stichesNumber * cellSize, rows * cellSize);
      drawGrid(rows, stichesNumber);
    },
    [colorsNumber, stichesNumber]
  );

  const drawGrid = (rows, cols) => {
    /*     console.log(rows, cols); */
    const gridCanvas = document.getElementById('gridCanvas') as HTMLCanvasElement;
    const gridCtx = gridCanvas.getContext('2d');
    if (!gridCtx) return;
    gridCanvas.width = cols * cellSize;
    gridCanvas.height = rows * cellSize;
    gridCtx.strokeStyle = '#ccc';
    gridCtx.lineWidth = 1;
    gridCtx.beginPath();
    for (let x = 0; x <= cols; x++) {
      gridCtx.moveTo(x * cellSize, 0);
      gridCtx.lineTo(x * cellSize, rows * cellSize);
    }
    for (let y = 0; y <= rows; y++) {
      gridCtx.moveTo(0, y * cellSize);
      gridCtx.lineTo(cols * cellSize, y * cellSize);
    }
    gridCtx.stroke();
  };

  // Исходная схема: массив цветов [[rgb, rgb, ...], [...], ...]
  //let scheme = [...];  твои данные

  // Прогресс: Set или boolean-массив
  const completed = new Set(); // например, "x,y" как строка

  const drawStitch = (x, y) => {
    const stitchCtx = (document.getElementById('stitchCanvas') as HTMLCanvasElement).getContext('2d');
    if (!stitchCtx) return;
    /*   const color = scheme[y][x]; */
    /*     stitchCtx.fillStyle = '#000';
    stitchCtx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize); */

    // Если стежок готов — добавим галочку или полупрозрачную заливку
    if (completed.has(`${x},${y}`)) {
      // Вариант A: затемнение
      stitchCtx.fillStyle = completed.has(`${x},${y}`) ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.4)';
      stitchCtx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);

      // Вариант B: галочка (сложнее, но красиво) — можно рисовать path
    }
  };

  // Перерисовать всю схему (при загрузке)
  /*   const redrawStitches = () => {
    const stitchCtx = (document.getElementById('stitchCanvas') as HTMLCanvasElement).getContext('2d');
    if (!stitchCtx) return;
    stitchCtx.clearRect(0, 0, w, h);
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        drawStitch(x, y);
      }
    }
  }; */

  const onStichClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
      const stitchCanvas = document.getElementById('stitchCanvas') as HTMLCanvasElement;

      const rect = stitchCanvas.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) / cellSize);
      const y = Math.floor((e.clientY - rect.top) / cellSize);

      if (x >= 0 && x < stichesNumber && y >= 0 && y < stichesNumber) {
        const key = `${x},${y}`;
        if (completed.has(key)) {
          completed.delete(key); // снять отметку
        } else {
          completed.add(key); // отметить как готовый
        }
        drawStitch(x, y); // перерисовать только один стежок!
      }
    },
    [stichesNumber]
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
      <div style={{ display: 'flex', flexDirection: 'column' }}></div>

      <div style={{ display: 'flex', flexDirection: 'column', padding: 20 }}>
        <input type="file" id="imageInput" accept="image/*" onChange={(e) => onInputChange(e)} />
        <canvas id="input" style={{ display: 'none' }}></canvas>

        <div style={{ position: 'relative', width: '800px', height: '800px' }}>
          <canvas id="output" style={{ position: 'absolute', top: 0, left: 0 }}></canvas>
          <canvas id="gridCanvas" style={{ position: 'absolute', top: 0, left: 0 }}></canvas>
          <canvas
            id="stitchCanvas"
            style={{ position: 'absolute', top: 0, left: 0, display: 'none' }}
            onClick={onStichClick}
          ></canvas>
        </div>
      </div>
    </div>
  );
};

export default Pattern;
