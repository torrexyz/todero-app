import { useMemo } from "react";
import { useSearchParams } from "react-router";

import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import { useTaskStore } from "@store/dashboard/todo/taskStore";
import { useTodoTask } from "@hooks/dashboard/todo/useTask";

import DEFAULT_FILTERS from "@constants/dashboard/todo/defaultFilters";

import { ImFileEmpty } from "react-icons/im";
import { VscBracketError } from "react-icons/vsc";
import { MdOutlineCloudDownload } from "react-icons/md";

import { consolError } from "@utils/consol";

import TaskItem from "./TaskItem";
import styles from "./TodoTaskList.module.css";

//====================//

export default function TodoTaskList({ onCommand }) {
  //..........//

  const tasksData = useTaskStore((state) => state.tasks);
  const taskError = useTaskStore((state) => state.error);
  const taskIsFetching = useTaskStore((state) => state.isFetching);

  const reorderTasks = useTaskStore((state) => state.reorderTasks);
  const modifyTask = useTaskStore((state) => state.modifyTask);

  const { refreshTasks } = useTodoTask();

  //..........//

  const [searchParams, setSearchParams] = useSearchParams();
  const projectParam = searchParams.get("project");
  const filterParam = searchParams.get("filter");

  const sortedTasks = useMemo(() => {
    const filteredTasks = projectParam
      ? Object.entries(tasksData).filter(([, value]) => {
          return value.project_id === projectParam;
        })
      : (DEFAULT_FILTERS[filterParam]?.call(
          Object.entries(tasksData).filter(([, value]) => {
            return value.project_id === null;
          }),
        ) ?? []);

    const sortTasks = filteredTasks.reduce(
      (collector, currentTask) => {
        if (
          typeof currentTask[1].position === "number" &&
          !collector.positioned[currentTask[1].position]
        ) {
          collector.positioned[currentTask[1].position] = currentTask;
        } else {
          collector.unpositioned.push(currentTask);
        }

        return collector;
      },
      { positioned: [], unpositioned: [] },
    );

    return [...sortTasks.positioned.filter(Boolean), ...sortTasks.unpositioned];
  }, [tasksData, projectParam, filterParam]);

  const sortedTaskIds = useMemo(
    () => sortedTasks.map(([taskId]) => taskId),
    [sortedTasks],
  );

  let skipEmptyTasks = false;
  if (sortedTasks.length === 0) skipEmptyTasks = true;

  //..........//

  const dndSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sortedTasks.findIndex((t) => t[0] === active.id);
    const newIndex = sortedTasks.findIndex((t) => t[0] === over.id);
    const newSortArray = arrayMove(sortedTasks, oldIndex, newIndex);

    const changedTasks = newSortArray
      .map(([taskId, taskData], index) => [taskId, taskData.position, index])
      .filter(([, prevPosition, index]) => prevPosition !== index);

    reorderTasks(newSortArray.map(([taskId]) => taskId));

    Promise.all(
      changedTasks.map(([taskId, , index]) =>
        onCommand("set-task", `${taskId} @position ${index}`),
      ),
    ).catch((err) => {
      consolError("#DOM:TASKS (REORDER)", err.message);
      changedTasks.forEach(([taskId, prevPosition]) =>
        modifyTask(taskId, { position: prevPosition }),
      );
      alert("¡Oops! Ocurrió un error al intentar reordenar las tareas.");
    });
  };

  const handleTaskClick = (evnt) => {
    const taskId = evnt.target.closest("[data-task-id]")?.dataset.taskId;
    if (!taskId || useTaskStore.getState().pendingIds[taskId]) return;

    setSearchParams((prevParams) => {
      prevParams.set("task", taskId);
      return prevParams;
    });
  };

  //..........//

  return (
    <>
      <ul className={styles.taskList} onClick={handleTaskClick}>
        {!taskError ? (
          !taskIsFetching ? (
            !skipEmptyTasks ? (
              <DndContext
                sensors={dndSensors}
                collisionDetection={closestCenter}
                onDragEnd={
                  projectParam ||
                  ["today", "tomorrow", "week", "month"].includes(filterParam)
                    ? handleDragEnd
                    : null
                }
              >
                <SortableContext
                  items={sortedTaskIds}
                  strategy={verticalListSortingStrategy}
                >
                  {sortedTasks.map(([taskId, taskData]) => {
                    return (
                      <TaskItem
                        key={taskId}
                        taskId={taskId}
                        taskData={taskData}
                        onCommand={onCommand}
                      />
                    );
                  })}
                </SortableContext>
              </DndContext>
            ) : (
              <li>
                <ImFileEmpty /> &nbsp;&nbsp;Sin tareas..
              </li>
            )
          ) : (
            <li>
              <MdOutlineCloudDownload /> &nbsp;&nbsp;Cargando tareas..
            </li>
          )
        ) : (
          <li onClick={refreshTasks}>
            <VscBracketError /> &nbsp;&nbsp;Error de carga
          </li>
        )}
      </ul>
    </>
  );
}
