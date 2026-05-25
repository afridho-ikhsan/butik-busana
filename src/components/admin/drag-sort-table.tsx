"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { UniqueIdentifier } from "@dnd-kit/core";
import { GripVertical } from "lucide-react";

export interface DragSortColumn<T> {
  key: string;
  header: string;
  render?: (item: T, index: number) => React.ReactNode;
}

interface DragSortTableProps<T extends { id: string; sortOrder?: number }> {
  items: T[];
  columns: DragSortColumn<T>[];
  renderActions: (item: T, index: number) => React.ReactNode;
  reorderUrl: string;
  sortOrderKey?: string;
  idKey?: string;
}

function SortableRow<T extends { id: string; sortOrder?: number }>({
  item,
  index,
  columns,
  renderActions,
}: {
  item: T;
  index: number;
  columns: DragSortColumn<T>[];
  renderActions: (item: T, index: number) => React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <tr ref={setNodeRef} style={style} className={isDragging ? "bg-blue-50" : ""}>
      <td className="w-10 px-4 py-3">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing inline-flex text-slate-500 hover:text-slate-700"
        >
          <GripVertical className="w-5 h-5" />
        </div>
      </td>
      {columns.map((col) => (
        <td key={col.key} className="px-4 py-3">
          {col.render ? col.render(item, index) : (item as Record<string, unknown>)[col.key] as React.ReactNode}
        </td>
      ))}
      <td className="px-4 py-3">{renderActions(item, index)}</td>
    </tr>
  );
}

export function DragSortTable<T extends { id: string; sortOrder?: number }>({
  items: initialItems,
  columns,
  renderActions,
  reorderUrl,
  sortOrderKey = "sortOrder",
  idKey = "id",
}: DragSortTableProps<T>) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i[idKey as keyof T] === active.id);
    const newIndex = items.findIndex((i) => i[idKey as keyof T] === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(items, oldIndex, newIndex);
    const withUpdatedOrder = reordered.map((item, index) => ({
      ...item,
      [sortOrderKey]: index,
    })) as T[];
    setItems(withUpdatedOrder);

    try {
      const res = await fetch(reorderUrl, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: withUpdatedOrder.map((i) => String(i[idKey as keyof T])) }),
      });
      if (!res.ok) throw new Error();
      toast.success("Urutan berhasil diubah");
      router.refresh();
    } catch {
      toast.error("Gagal mengubah urutan");
      setItems(items);
    }
  };

  return (
    <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-auto">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={items.map((i) => i[idKey as keyof T] as UniqueIdentifier)}
          strategy={verticalListSortingStrategy}
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100">
                <th className="text-left px-4 py-3 w-10" />
                {columns.map((col) => (
                  <th key={col.key} className="text-left px-4 py-3">
                    {col.header}
                  </th>
                ))}
                <th className="text-left px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <SortableRow
                  key={String(item[idKey as keyof T])}
                  item={item}
                  index={index}
                  columns={columns}
                  renderActions={renderActions}
                />
              ))}
            </tbody>
          </table>
        </SortableContext>
      </DndContext>
    </div>
  );
}
