import { useCallback, useEffect, useMemo, useState } from 'react';
import Draggable from '../shared/ui/Draggable';
import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import Droppable from '../shared/ui/Droppable';
import { type Card, Cards, Suits, initDeck, neighbourMap } from '../shared/types/cards-two';

import { useSolitairTwo } from '../shared/stores/solitairStoreTwo';
import { Modal, Button } from '@mantine/core';
import { groupBy } from 'lodash';

const SolitairTwo = () => {
  const tableCards = useSolitairTwo((state) => state.tableCards);
  const houseCards = useSolitairTwo((state) => state.houseCards);
  const handsCards = useSolitairTwo((state) => state.handsCards);
  const congrats = useSolitairTwo((state) => state.congrats);
  const onStart = useSolitairTwo((state) => state.start);
  const onSetCongrats = useSolitairTwo((state) => state.setCongrats);
  const onReshuffle = useSolitairTwo((state) => state.reshuffle);
  const onMove = useSolitairTwo((state) => state.move);

  const [reshuffles, setReshuffles] = useState(0);

  const start = () => {
    setReshuffles(0);
    onStart();
  };

  const handleDragEnd = useCallback((params: DragEndEvent) => {
    const { over, active } = params;
    if (!over) return;
    onMove({ card: active.data.current as Card, to: over.id });
  }, []);

  const groupedCards = useMemo(() => {
    return groupBy(
      tableCards.sort((a, b) => +(a.position?.pile.split('_')[1] ?? 0) - +(b.position?.pile.split('_')[1] ?? 0)),
      (item) => item.position?.pile
    );
  }, [tableCards]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
      <button onClick={onReshuffle} disabled={reshuffles >= 2}>
        пересдать
      </button>
      <button onClick={start}>заново</button>
      <DndContext onDragEnd={handleDragEnd}>
        <div style={{ display: 'flex', gap: '20px' }}>
          {Object.entries(groupedCards).map(([key, val], index) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {val.map((v) => {
                const url = `/cards/${v.card}_of_${v.suit}.svg`;

                return (
                  <>
                    {v.position?.order === val.length - 1 ? (
                      <Draggable id={v.id} data={v}>
                        {v.position?.pile}
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
                          height: '20px',
                          background: 'green',
                        }}
                      ></div>
                    )}
                  </>
                );
              })}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          {houseCards.map((item) => {
            const url = `/cards/${item.card}_of_${item.suit}.svg`;
            return (
              <>
                <Droppable id={item.position?.pile ?? ''}>
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
        <div style={{ display: 'flex' }}>
          {handsCards.map((item) => {
            const url = `/cards/${item.card}_of_${item.suit}.svg`;

            return (
              <Draggable id={item.id} data={item}>
                <div
                  style={{
                    width: '103px',
                    height: '150px',
                    backgroundImage: `url(${url})`,
                    backgroundSize: 'cover',
                  }}
                ></div>
              </Draggable>
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

export default SolitairTwo;
