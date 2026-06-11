"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Reorder, useDragControls, type DragControls } from "framer-motion";

type Props<T> = {
  items: T[];
  getId: (item: T) => string;
  /** Persist the new order (debounced after a drag settles). */
  onReorder: (orderedIds: string[]) => void;
  /** Render the row; `controls.start(e)` on a handle's onPointerDown starts a drag. */
  children: (item: T, controls: DragControls) => ReactNode;
  axis?: "x" | "y";
  className?: string;
};

function ReorderableItem<T>({
  id,
  item,
  render,
}: {
  id: string;
  item: T;
  render: (item: T, controls: DragControls) => ReactNode;
}) {
  const controls = useDragControls();
  return (
    <Reorder.Item value={id} dragListener={false} dragControls={controls}>
      {render(item, controls)}
    </Reorder.Item>
  );
}

/**
 * Drag-and-drop reorderable list (framer-motion). Dragging is handle-driven
 * (`dragListener={false}`) so the rest of the row stays clickable. Persists the
 * final order debounced; re-syncs when server items change.
 */
export function Reorderable<T>({
  items,
  getId,
  onReorder,
  children,
  axis = "y",
  className,
}: Props<T>) {
  const [order, setOrder] = useState<string[]>(() => items.map(getId));
  const idsKey = items.map(getId).join(",");
  const persist = useRef(onReorder);
  persist.current = onReorder;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setOrder(items.map(getId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey]);

  const byId = new Map(items.map((it) => [getId(it), it]));

  function handleReorder(next: string[]) {
    setOrder(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => persist.current(next), 500);
  }

  return (
    <Reorder.Group
      axis={axis}
      values={order}
      onReorder={handleReorder}
      className={className}
    >
      {order.map((id) => {
        const item = byId.get(id);
        if (!item) return null;
        return (
          <ReorderableItem key={id} id={id} item={item} render={children} />
        );
      })}
    </Reorder.Group>
  );
}
