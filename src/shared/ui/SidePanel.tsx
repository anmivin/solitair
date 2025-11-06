import { TextInput } from '@mantine/core';
import { type ChangeEvent, type Dispatch, type SetStateAction } from 'react';

interface SidePanelProps {
  colorsNumber: number;
  setColorsNumber: Dispatch<SetStateAction<number>>;
  stichesNumber: number;
  setStichesNumber: Dispatch<SetStateAction<number>>;
  onInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
}
const SidePanel = (props: SidePanelProps) => {
  const { onInputChange, colorsNumber, setColorsNumber, stichesNumber, setStichesNumber } = props;

  return (
    <div style={{ height: '100vh', width: '200px', borderRight: '2px solid violet', padding: 10 }}>
      <input type="file" id="imageInput" accept="image/*" onChange={onInputChange} />
      <TextInput
        type="number"
        placeholder="2-1000"
        label="Количество цветов"
        value={colorsNumber}
        onChange={(e) => setColorsNumber(+e.currentTarget.value)}
      />
      <TextInput
        type="number"
        placeholder="2-1000"
        label="Количество стежков"
        value={stichesNumber}
        onChange={(e) => setStichesNumber(+e.currentTarget.value)}
      />
    </div>
  );
};

export default SidePanel;
