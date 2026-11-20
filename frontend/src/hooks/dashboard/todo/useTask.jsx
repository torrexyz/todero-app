import { useEffect, useMemo } from "react";

import { useAuth } from "@context/AuthContext";
import { useTaskStore } from "@store/dashboard/todo/taskStore";

//====================//

export function useTodoTask({ autoFetch = false } = {}) {
  //..........//

  const { sessdata } = useAuth();
  const userId = sessdata?.userId;

  //..........//

  const fetchTasks = useTaskStore((state) => state.fetchTasks);
  const createTask = useTaskStore((state) => state.createTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const updateTask = useTaskStore((state) => state.updateTask);

  //..........//

  useEffect(() => {
    if (autoFetch && userId) fetchTasks(userId).catch(() => null);
  }, [autoFetch, userId, fetchTasks]);

  //..........//

  return useMemo(
    () => ({
      refreshTasks: () =>
        fetchTasks(userId, true).catch(() => null),

      createTask: (projectId, title, expiresAt) =>
        createTask(userId, projectId, title, expiresAt),

      deleteTask: (taskId, removeDelay) =>
        deleteTask(userId, taskId, removeDelay),
      
      updateTask: (taskId, column, value) =>
        updateTask(userId, taskId, column, value),
    }),
    [userId, fetchTasks, createTask, deleteTask, updateTask],
  );
}
