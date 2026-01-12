import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Button, Modal, NativeSelect, TextInput } from '@mantine/core';
import pal from '../../public/pal.json';
import Cropper, { type ReactCropperElement } from 'react-cropper';
import 'react-cropper/node_modules/cropperjs/dist/cropper.css';
import SidePanel from '../shared/ui/SidePanel';
import { read, utils } from 'xlsx';
import { keyBy } from 'lodash';
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

    const rows = Math.round((img.height / img.width) * stichesNumber); // сохраняем пропорции

    const outCanvas = document.getElementById('output') as HTMLCanvasElement;
    const outCtx = outCanvas.getContext('2d');
    if (!outCtx) return;
    outCanvas.width = img.width;
    outCanvas.height = img.height;

    outCtx.drawImage(img, 0, 0);
    setModalOpen(false);

    drawGrid(rows, stichesNumber);
  }, [stichesNumber]);
  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh' }}>
      <SidePanel
        onInputChange={onInputChange}
        colorsNumber={colorsNumber}
        setColorsNumber={setColorsNumber}
        stichesNumber={stichesNumber}
        setStichesNumber={setStichesNumber}
      />
      <Button
        onClick={() => {
          console.log(keyBy(pal, 'dmc'));
        }}
      >
        kkdkdkd
      </Button>
      <div style={{ display: 'flex', flexDirection: 'column' }}></div>

      <div style={{ display: 'flex', flexDirection: 'column', padding: 20 }}>
        {/*         {palette.map((p) => (
          <div style={{ display: 'flex' }}>
            <p>{p.dmc}</p> <div style={{ background: p.hex, width: '150px', height: '50px' }} />
            <p>{p.name}</p>
          </div>
        ))} */}
        {/* <input
          type="file"
          onChange={(e) => {
            console.log(e);
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
              const binaryStr = event.target.result;
              const workbook = read(binaryStr, { type: 'binary' });
              const sheetName = workbook.SheetNames[0];
              const worksheet = workbook.Sheets[sheetName];
              const data = utils.sheet_to_json(worksheet);
             console.log(
                data.map((d) => ({
                  dmc: d.DMC,
                  rgb: { r: d.Red, g: d.Green, b: d.Blue },
                  name: d['Floss Name'],
                  hex: d['Hex Code'],
                }))
              ); 
            };
            reader.readAsBinaryString(file);
          }}
        /> */}
        <input type="file" id="imageInput" accept="image/*" onChange={(e) => createCropperSrc(e)} />
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
            <Cropper
              src={imgUrl}
              style={{ height: '80vh' /*  width: '100%' */ }}
              guides={false}
              ref={cropperRef}
              /*           crop={onCrop} */
            />
            <button onClick={onCrop}>Crop Image</button>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default Pattern;
