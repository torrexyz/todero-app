import { create } from "zustand";

import todoTaskAPI from "@services/dashboard/todo/useTask";

import { normalizeById } from "@utils/normalizeById";
import { consolInfo, consolWarn, consolError } from "@utils/consol";

//====================//

export const useTaskStore = create((set, get) => ({
  //..........//

  tasks: {},
  pendingIds: {},
  loaded: false,
  error: null,
  isLoading: false,
  isFetching: false,

  //..........//

  setTasks: (tasks) => set(() => ({ tasks, loaded: true })),

  setError: (error) => set({ error }),

  setIsLoading: (isLoading) => set({ isLoading }),

  setIsFetching: (isFetching) => set({ isFetching }),

  setPending: (id, isPending) =>
    set((state) => {
      const newPendingIds = { ...state.pendingIds };
      if (isPending) newPendingIds[id] = true;
      else delete newPendingIds[id];
      return { pendingIds: newPendingIds };
    }),

  //..........//

  addTask: (id, data) =>
    set((state) => ({
      tasks: { ...state.tasks, [id]: data },
    })),

  removeTask: (id) =>
    set((state) => {
      const newTasks = { ...state.tasks };
      delete newTasks[id];
      return { tasks: newTasks };
    }),

  modifyTask: (id, data) =>
    set((state) => ({
      tasks: {
        ...state.tasks,
        [id]: { ...state.tasks[id], ...data },
      },
    })),

  reorderTasks: (orderedIds) =>
    set((state) => {
      const newTasks = { ...state.tasks };

      orderedIds.forEach((id, index) => {
        if (newTasks[id] && newTasks[id].position !== index)
          newTasks[id] = { ...newTasks[id], position: index };
      });

      return { tasks: newTasks };
    }),

  //..........//

  fetchTasks: async (userId, force = false) => {
    const taskStore = get();

    if (!force && taskStore.loaded) {
      consolWarn("#API:TASKS (FETCH)", "(CACHE) Data already loaded");
      return;
    }

    if (taskStore.isFetching) {
      consolWarn("#API:TASKS (FETCH)", "(ABORT) Previous fetch not finished");
      return;
    }

    taskStore.setError(null);
    taskStore.setIsFetching(true);
    consolInfo("#API:TASKS (FETCH)", "(PROCESS) Fetching data..");

    try {
      const execute = await todoTaskAPI.fetchTasks({ userId });

      get().setTasks(normalizeById(execute.data));

      consolInfo("#API:TASKS (FETCH)", "(SUCCESS) Data fetched");
      return execute;
    } catch (err) {
      consolError("#API:TASKS (FETCH)", err.message);
      get().setError(err.message);
      throw err;
    } finally {
      get().setIsFetching(false);
    }
  },

  createTask: async (userId, projectId, title, expiresAt) => {
    get().setIsLoading(true);
    consolInfo("#API:TASKS (CREATE)", "(PROCESS) Creating task..");

    try {
      const execute = await todoTaskAPI.createTask({
        userId,
        projectId,
        title,
        expiresAt: expiresAt || null,
      });

      get().addTask(execute.data.public_id, execute.data);

      consolInfo("#API:TASKS (CREATE)", "(SUCCESS) Task created");
      return execute;
    } catch (err) {
      consolError("#API:TASKS (CREATE)", err.message);
      throw err;
    } finally {
      get().setIsLoading(false);
    }
  },

  deleteTask: async (userId, taskId, removeDelay = 0) => {
    get().setPending(taskId, true);
    consolInfo("#API:TASKS (DELETE)", "(PROCESS) Deleting task..");

    try {
      const execute = await todoTaskAPI.deleteTask({ userId, taskId });

      if (removeDelay) setTimeout(() => get().removeTask(taskId), removeDelay);
      else get().removeTask(taskId);

      consolInfo("#API:TASKS (DELETE)", "(SUCCESS) Task deleted");
      return execute;
    } catch (err) {
      consolError("#API:TASKS (DELETE)", err.message);
      throw err;
    } finally {
      get().setPending(taskId, false);
    }
  },

  updateTask: async (userId, taskId, column, value) => {
    get().setPending(taskId, true);
    consolInfo("#API:TASKS (UPDATE)", `(PROCESS) Updating ${column} in task..`);

    try {
      const execute = await todoTaskAPI.updateTask({
        userId,
        taskId,
        column,
        value,
      });

      get().modifyTask(execute.data.public_id, execute.data);

      consolInfo("#API:TASKS (UPDATE)", `(SUCCESS) Task ${column} updated`);
      return execute;
    } catch (err) {
      consolError("#API:TASKS (UPDATE)", err.message);
      throw err;
    } finally {
      get().setPending(taskId, false);
    }
  },

  //..........//

  clearAll: () =>
    set({
      tasks: {},
      pendingIds: {},
      loaded: false,
      error: null,
      isLoading: false,
      isFetching: false,
    }),

  //..........//
}));
