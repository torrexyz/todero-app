import { memo, useOptimistic, useTransition } from "react";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { useTaskStore } from "@store/dashboard/todo/taskStore";

//====================//

function TaskItem({ taskId, taskData, onCommand }) {
  //..........//

  const taskIsPending = useTaskStore((state) => !!state.pendingIds[taskId]);

  const [optimisticChecked, setOptimisticChecked] = useOptimistic(!!taskData.is_checked);
  const [checkIsPending, startCheckTransition] = useTransition();

  //..........//

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: taskId });

  //..........//

  const handleCheckChange = () => {
    const newChecked = !optimisticChecked;

    startCheckTransition(async () => {
      setOptimisticChecked(newChecked);

      try {
        await onCommand("set-task", `${taskId} @is_checked ${newChecked}`);
      } catch {
        alert(
          "¡Oops! Ocurrió un error al intentar actualizar el estado de la tarea.",
        );
      }
    });
  };

  //..........//

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        cursor: "grab",
        touchAction: "none",
      }}
      data-task-id={taskId}
      {...attributes}
      {...listeners}
    >
      <input
        type="checkbox"
        checked={optimisticChecked}
        disabled={taskIsPending || checkIsPending}
        onClick={(evnt) => evnt.stopPropagation()}
        onChange={handleCheckChange}
      />
      <p>{taskData.title}</p>
    </li>
  );
}

//====================//

export default memo(TaskItem);
