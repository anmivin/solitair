import { useCallback, useMemo, useState } from 'react';
import Draggable from '../shared/ui/Draggable';
import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import Droppable from '../shared/ui/Droppable';
import { type Card } from '../shared/types/cards';
import { groupBy } from 'lodash';
import { Modal, Button } from '@mantine/core';
import { useSolitair } from '../shared/stores/solitairStore';

const Solitair = () => {
  const [reshuffles, setReshuffles] = useState(0);
  const tableCards = useSolitair((state) => state.tableCards);
  const houseCards = useSolitair((state) => state.houseCards);
  const congrats = useSolitair((state) => state.congrats);
  const currentHystory = useSolitair((state) => state.history);
  const onMove = useSolitair((state) => state.move);
  const start = useSolitair((state) => state.start);
  const onReshuffle = useSolitair((state) => state.reshuffle);
  const onSetCongrats = useSolitair((state) => state.setCongrats);
  const onStart = () => {
    setReshuffles(0);
    start();
  };
  const onBack = useSolitair((state) => state.back);

  const handleDragEnd = useCallback((params: DragEndEvent) => {
    const { over, active } = params;
    if (!over) return;
    onMove({ card: active.data.current as Card, to: over.id.toString() });
  }, []);

  const groupedCards = useMemo(() => {
    return groupBy(
      tableCards.sort((a, b) => +(a.position?.pile.split('_')[1] ?? 0) - +(b.position?.pile.split('_')[1] ?? 0)),
      (item) => item.position?.pile
    );
  }, [tableCards]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
      <Button onClick={onReshuffle} disabled={reshuffles >= 2}>
        пересдать
      </Button>
      <Button onClick={start}>заново</Button>
      <Button onClick={onBack} disabled={currentHystory.length <= 1}>
        отменить
      </Button>

      <DndContext onDragEnd={handleDragEnd}>
        <div style={{ display: 'grid', gridTemplateColumns: `1fr 1fr 1fr 1fr`, gap: '20px' }}>
          {Object.entries(groupedCards).map(([key, val]) => (
            <div style={{ display: 'flex', border: '1px solid blue' }}>
              {val
                .sort((a, b) => (a.position?.order ?? 0) - (b.position?.order ?? 0))
                .map((i, ind) => {
                  const url = `${import.meta.env.BASE_URL}cards/${i.card}_of_${i.suit}.svg`;
                  return (
                    <>
                      {ind === val.length - 1 ? (
                        <Draggable id={i.id} data={i}>
                          <div
                            style={{
                              width: '103px',
                              height: '150px',
                              backgroundImage: `url(${url})`,
                              backgroundSize: 'cover',
                            }}
                          ></div>
                        </Draggable>
                      ) : (
                        <div
                          style={{
                            width: '103px',
                            height: '150px',
                            backgroundImage: `url(${url})`,
                            backgroundSize: 'cover',
                            filter: 'saturate(20%)',
                          }}
                        ></div>
                      )}
                    </>
                  );
                })}
              {!!val.length && val.length < 3 && (
                <Droppable id={`${key}-${val.length}`}>
                  <div style={{ border: '2px dashed black', width: '100px', height: '150px' }}></div>
                </Droppable>
              )}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          {Object.entries(houseCards).map(([key, value]) => {
            const url = value[0]
              ? `${import.meta.env.BASE_URL}cards/${value[0].card}_of_${value[0].suit}.svg`
              : `${import.meta.env.BASE_URL}cards/${key}.svg`;

            return (
              <>
                <Droppable id={`house_${key}`}>
                  <div
                    style={{
                      width: '103px',
                      height: '150px',
                      backgroundImage: `url(${url})`,
                      backgroundSize: 'cover',
                    }}
                  ></div>
                </Droppable>
              </>
            );
          })}
        </div>
      </DndContext>
      <Modal opened={congrats} onClose={() => onSetCongrats(false)} title="МАЛАДЕЧ">
        <div style={{ background: 'cyan', padding: '40px' }}> ура победа</div>
        <Button
          onClick={() => {
            onStart();
            onSetCongrats(false);
          }}
        >
          ещё разок
        </Button>
      </Modal>
    </div>
  );
};

export default Solitair;
