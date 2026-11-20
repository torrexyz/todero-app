import { isValidElement, useMemo } from "react";
import { useLocation, useNavigate, Navigate, useSearchParams } from "react-router";

import TodoAsideList from "@components/dashboard/Todo/AsideList/TodoAsideList";
import TodoInputLine from "@components/dashboard/Todo/InputLine/TodoInputLine";
import TodoTaskList from "@components/dashboard/Todo/TaskList/TodoTaskList";
import TodoKanbanView from "@components/dashboard/Todo/KanbanView/TodoKanbanView";
import TodoTaskBoard from "@components/dashboard/Todo/TaskBoard/TodoTaskBoard";

import { useTaskStore } from "@store/dashboard/todo/taskStore";
import { useProjectStore } from "@store/dashboard/todo/projectStore";

import { useTodoTask } from "@hooks/dashboard/todo/useTask";
import { useTodoProject } from "@hooks/dashboard/todo/useProject";
import { useTodoKanban } from "@hooks/dashboard/todo/useKanban";

import DEFAULT_FILTERS from "@constants/dashboard/todo/defaultFilters";

import commandHandler from "./commandHandler";
import styles from "./TodoPage.module.css";

//====================//

export default function TodoPage() {
  //..........//

  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const filterParam = searchParams.get("filter");
  const projectParam = searchParams.get("project");
  const taskParam = searchParams.get("task");

  //..........//

  const currentProject = useProjectStore((state) => state.projects[projectParam]);
  const projectsLoaded = useProjectStore((state) => state.loaded);

  const currentTask = useTaskStore((state) => state.tasks[taskParam]);
  const tasksLoaded = useTaskStore((state) => state.loaded);

  //..........//

  const { createProject, deleteProject } = useTodoProject({ autoFetch: true });
  const { createTask, deleteTask, updateTask } = useTodoTask({ autoFetch: true });
  const { createKbcolumn, deleteKbcolumn } = useTodoKanban();

  //..........//

  const handleCommand = useMemo(
    () =>
      commandHandler({
        navigate,

        createProject,
        deleteProject,

        createTask,
        deleteTask,
        updateTask,

        createKbcolumn,
        deleteKbcolumn,
      }),
    [
      navigate,

      createProject,
      deleteProject,

      createTask,
      deleteTask,
      updateTask,

      createKbcolumn,
      deleteKbcolumn,
    ],
  );

  const isPendingData = taskParam
    ? !tasksLoaded
    : projectParam
      ? !projectsLoaded
      : false;

  const currentFilter =
    DEFAULT_FILTERS[filterParam]?.element ||
    currentProject?.pname ||
    (isPendingData ? "..." : "(?) desconocido");

  //..........//

  if (
    isPendingData ||
    (!taskParam ? currentProject || isValidElement(currentFilter) : currentTask)
  ) {
    return (
      <>
        <TodoAsideList />

        <div className={styles.todoPage}>
          <h1 className={styles.title}>{currentFilter}</h1>

          <TodoInputLine onCommand={handleCommand} />

          <TodoTaskList onCommand={handleCommand} />
          <TodoKanbanView />

          <TodoTaskBoard
            taskId={taskParam}
            currentTask={currentTask}
            onCommand={handleCommand}
          />
        </div>
      </>
    );
  } else return <Navigate to={location.pathname + "?filter=today"} replace />;
}
