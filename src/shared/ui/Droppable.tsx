import { useDroppable } from '@dnd-kit/core';
import { type ReactNode } from 'react';

interface DroppableProps {
  id: string;
  children: ReactNode;
}

const Droppable = (props: DroppableProps) => {
  const { id, children } = props;
  const { isOver, setNodeRef } = useDroppable({
    id,
  });
  const style = {
    opacity: isOver ? 0.7 : 1,
    width: '103px',
    height: '150px',
  };

  return (
    <div ref={setNodeRef} style={style}>
      {children}
    </div>
  );
};

export default Droppable;
