import { useCallback, useRef, useState, type ChangeEvent } from 'react';
import { Modal } from '@mantine/core';
import pal from '../../public/pal.json';
import Cropper, { type ReactCropperElement } from 'react-cropper';
import 'react-cropper/node_modules/cropperjs/dist/cropper.css';
import SidePanel from '../shared/ui/SidePanel';

const Pattern = () => {
  const simplePalette = [
    { name: 'black', r: 0, g: 0, b: 0 },
    { name: 'white', r: 255, g: 255, b: 255 },
    { name: 'gray', r: 128, g: 128, b: 128 },
    { name: 'red', r: 255, g: 0, b: 0 },
    { name: 'lime', r: 0, g: 255, b: 0 },
    { name: 'blue', r: 0, g: 0, b: 255 },
    { name: 'yellow', r: 255, g: 255, b: 0 },
    { name: 'cyan', r: 0, g: 255, b: 255 },
    { name: 'magenta', r: 255, g: 0, b: 255 },
    { name: 'darkgray', r: 64, g: 64, b: 64 },
    { name: 'lightgray', r: 192, g: 192, b: 192 },
    { name: 'silver', r: 192, g: 192, b: 192 },
    { name: 'maroon', r: 128, g: 0, b: 0 },
    { name: 'green', r: 0, g: 128, b: 0 },
    { name: 'navy', r: 0, g: 0, b: 128 },
    { name: 'olive', r: 128, g: 128, b: 0 },
    { name: 'purple', r: 128, g: 0, b: 128 },
    { name: 'teal', r: 0, g: 128, b: 128 },
    { name: 'orange', r: 255, g: 165, b: 0 },
    { name: 'pink', r: 255, g: 192, b: 203 },
    { name: 'brown', r: 165, g: 42, b: 42 },
    { name: 'gold', r: 255, g: 215, b: 0 },
    { name: 'coral', r: 255, g: 127, b: 80 },
    { name: 'violet', r: 238, g: 130, b: 238 },
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

  const rgbToLab = (r: number, g: number, b: number) => {
    // sRGB → linear RGB
    const lin = (c: number) => {
      c = c / 255;
      return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };

    const lr = lin(r),
      lg = lin(g),
      lb = lin(b);

    // RGB → XYZ (D65 illuminant)
    const x = lr * 0.4124 + lg * 0.3576 + lb * 0.1805;
    const y = lr * 0.2126 + lg * 0.7152 + lb * 0.0722;
    const z = lr * 0.0193 + lg * 0.1192 + lb * 0.9505;

    // XYZ → LAB
    const f = (t: number) => (t > 0.008856 ? Math.pow(t, 1 / 3) : 7.787 * t + 16 / 116);

    const xn = 0.95047; // D65
    const yn = 1.0;
    const zn = 1.08883;

    const fx = f(x / xn);
    const fy = f(y / yn);
    const fz = f(z / zn);

    const L = 116 * fy - 16;
    const a = 500 * (fx - fy);
    const b_ = 200 * (fy - fz);

    return { L, a, b: b_ };
  };

  const getClosestColorg = (
    pixelColor: { r: number; g: number; b: number },
    palette: { r: number; g: number; b: number }[]
  ) => {
    const pixelLab = rgbToLab(pixelColor.r, pixelColor.g, pixelColor.b);
    let minDist = Infinity;
    let closest = palette[0];

    for (const color of palette) {
      const lab = rgbToLab(color.r, color.g, color.b);
      const dist = Math.sqrt((pixelLab.L - lab.L) ** 2 + (pixelLab.a - lab.a) ** 2 + (pixelLab.b - lab.b) ** 2);

      if (dist < minDist) {
        minDist = dist;
        closest = color;
      }
    }

    return closest;
  };

  const drawGrid = (rows, cols) => {
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

  const completed = new Set();

  const drawStitch = (x, y) => {
    const stitchCtx = (document.getElementById('stitchCanvas') as HTMLCanvasElement).getContext('2d');
    if (!stitchCtx) return;
    if (completed.has(`${x},${y}`)) {
      stitchCtx.fillStyle = completed.has(`${x},${y}`) ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.4)';
      stitchCtx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
    }
  };

  const onStichClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
      const stitchCanvas = document.getElementById('stitchCanvas') as HTMLCanvasElement;

      const rect = stitchCanvas.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) / cellSize);
      const y = Math.floor((e.clientY - rect.top) / cellSize);

      if (x >= 0 && x < stichesNumber && y >= 0 && y < stichesNumber) {
        const key = `${x},${y}`;
        if (completed.has(key)) {
          completed.delete(key);
        } else {
          completed.add(key);
        }
        drawStitch(x, y);
      }
    },
    [stichesNumber]
  );

  const canvasRef = useRef(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [imgUrl, setImgUrl] = useState('');
  const cropperRef = useRef<ReactCropperElement | null>(null);

  const createCropperSrc = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    const url = URL.createObjectURL(file);
    setImgUrl(url);
    setModalOpen(true);
  };

  const onCrop = useCallback(async () => {
    const imageElement = cropperRef?.current;
    const cropper = imageElement?.cropper;

    const url = cropper?.getCroppedCanvas().toDataURL();
    const img = new Image();
    if (!url) return;
    img.src = url;
    await img.decode();

    const inputCanvas = document.getElementById('input') as HTMLCanvasElement;
    const inputCtx = inputCanvas.getContext('2d');
    if (!inputCtx) return;

    const rows = Math.round((img.height / img.width) * stichesNumber);
    inputCanvas.width = stichesNumber;
    inputCanvas.height = rows;
    inputCtx.imageSmoothingEnabled = false;
    inputCtx.drawImage(img, 0, 0, stichesNumber, rows);

    const imageData = inputCtx.getImageData(0, 0, stichesNumber, rows);

    for (let i = 0; i < imageData.data.length; i += 4) {
      const r = imageData.data[i];
      const g = imageData.data[i + 1];
      const b = imageData.data[i + 2];
      const closest = getClosestColorg({ r, g, b }, simplePalette.slice(0, colorsNumber));

      imageData.data[i] = closest.r;
      imageData.data[i + 1] = closest.g;
      imageData.data[i + 2] = closest.b;
    }

    inputCtx.putImageData(imageData, 0, 0);
    const outCanvas = document.getElementById('output') as HTMLCanvasElement;
    const outCtx = outCanvas.getContext('2d');
    if (!outCtx) return;
    outCanvas.width = stichesNumber * cellSize;
    outCanvas.height = rows * cellSize;

    outCtx.imageSmoothingEnabled = false;
    outCtx.drawImage(inputCanvas, 0, 0, stichesNumber * cellSize, rows * cellSize);
    drawGrid(rows, stichesNumber);
    setModalOpen(false);
  }, [stichesNumber, colorsNumber]);

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh' }}>
      <SidePanel
        onInputChange={createCropperSrc}
        colorsNumber={colorsNumber}
        setColorsNumber={setColorsNumber}
        stichesNumber={stichesNumber}
        setStichesNumber={setStichesNumber}
      />

      <div style={{ display: 'flex', flexDirection: 'column' }}></div>

      <div style={{ display: 'flex', flexDirection: 'column', padding: 20 }}>
        <canvas id="input" style={{ display: 'none' }}></canvas>

        <div style={{ position: 'relative', width: '800px', height: '800px' }}>
          <canvas id="output" style={{ position: 'absolute', top: 0, left: 0 }} ref={canvasRef}></canvas>
          <canvas id="gridCanvas" style={{ position: 'absolute', top: 0, left: 0 }}></canvas>
          <canvas
            id="stitchCanvas"
            style={{ position: 'absolute', top: 0, left: 0, display: 'none' }}
            onClick={onStichClick}
          ></canvas>

          <Modal opened={modalOpen} onClose={() => setModalOpen(false)} size="100%">
            <Cropper src={imgUrl} style={{ height: '80vh' }} guides={false} ref={cropperRef} />
            <button onClick={onCrop}>Crop Image</button>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default Pattern;
