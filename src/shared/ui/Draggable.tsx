import { CSS } from '@dnd-kit/utilities';
import { useDraggable } from '@dnd-kit/core';
import type { ReactNode } from 'react';
import type { Card } from '../types/cards';

interface DraggableProps {
  id: string;
  data: Card
  children: ReactNode;
}

const Draggable = (props: DraggableProps) => {
  const { id, children, data } = props;
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
    data
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };
  return (
    <div ref={setNodeRef} {...listeners} {...attributes} style={style}>
      {children}
    </div>
  );
};

export default Draggable;
