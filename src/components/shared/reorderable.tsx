"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  verticalListSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/** Props to spread onto the drag-handle element (button). Includes the dnd-kit
 *  listeners + a11y attributes (keyboard reordering works when focused). */
export type DragHandle = Record<string, unknown>;

type Props<T> = {
  items: T[];
  getId: (item: T) => string;
  onReorder: (orderedIds: string[]) => void;
  children: (item: T, handle: DragHandle) => ReactNode;
  /** "list" = vertical; "grid" = wrapping grid (use for multi-column). */
  strategy?: "list" | "grid";
  className?: string;
};

function SortableRow({
  id,
  render,
}: {
  id: string;
  render: (handle: DragHandle) => ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : undefined,
      }}
      className={isDragging ? "opacity-90" : undefined}
    >
      {render({ ...attributes, ...(listeners ?? {}) })}
    </div>
  );
}

/**
 * Drag-and-drop reorderable list or grid (dnd-kit). Drag from a handle that
 * spreads the provided `handle` props; keyboard reordering works too. Persists
 * the final order (debounced) and re-syncs when server items change.
 */
export function Reorderable<T>({
  items,
  getId,
  onReorder,
  children,
  strategy = "list",
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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const byId = new Map(items.map((it) => [getId(it), it]));

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setOrder((prev) => {
      const next = arrayMove(
        prev,
        prev.indexOf(active.id as string),
        prev.indexOf(over.id as string)
      );
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => persist.current(next), 400);
      return next;
    });
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext
        items={order}
        strategy={
          strategy === "grid" ? rectSortingStrategy : verticalListSortingStrategy
        }
      >
        <div className={className}>
          {order.map((id) => {
            const item = byId.get(id);
            if (!item) return null;
            return (
              <SortableRow key={id} id={id} render={(h) => children(item, h)} />
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
}
