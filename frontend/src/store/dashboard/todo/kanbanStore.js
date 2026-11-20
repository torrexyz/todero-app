import { create } from "zustand";

import todoKanbanAPI from "@services/dashboard/todo/useKanban";

import { normalizeById } from "@utils/normalizeById";
import { consolInfo, consolWarn, consolError } from "@utils/consol";

//====================//

export const useKanbanStore = create((set, get) => ({
  //..........//

  kbcolumns: {},
  loaded: false,
  error: null,
  isLoading: false,
  isFetching: false,

  //..........//

  setKbcolumns: (kbcolumns) => set(() => ({ kbcolumns, loaded: true })),

  setError: (error) => set({ error }),

  setIsLoading: (isLoading) => set({ isLoading }),

  setIsFetching: (isFetching) => set({ isFetching }),

  //..........//

  addKbcolumn: (id, data) =>
    set((state) => ({
      kbcolumns: { ...state.kbcolumns, [id]: data },
    })),

  removeKbcolumn: (id) =>
    set((state) => {
      const newKanban = { ...state.kbcolumns };
      delete newKanban[id];
      return { kbcolumns: newKanban };
    }),

  modifyKbcolumn: (id, data) =>
    set((state) => ({
      kbcolumns: {
        ...state.kbcolumns,
        [id]: { ...state.kbcolumns[id], ...data },
      },
    })),

  //..........//

  fetchKbcolumns: async (userId, projectId, force = false) => {
    const kanbanStore = get();

    if (!force && kanbanStore.loaded) {
      consolWarn("#API:KANBAN (FETCH)", "(CACHE) Data already loaded");
      return;
    }

    if (kanbanStore.isFetching) {
      consolWarn("#API:KANBAN (FETCH)", "(ABORT) Previous fetch not finished");
      return;
    }

    kanbanStore.setError(null);
    kanbanStore.setIsFetching(true);
    consolInfo("#API:KANBAN (FETCH)", "(PROCESS) Fetching data..");

    try {
      const execute = await todoKanbanAPI.fetchKbcolumns({
        userId,
        projectId,
      });

      get().setKbcolumns(normalizeById(execute.data));

      consolInfo("#API:KANBAN (FETCH)", "(SUCCESS) Data fetched");
      return execute;
    } catch (err) {
      consolError("#API:KANBAN (FETCH)", err.message);
      get().setError(err.message);
      throw err;
    } finally {
      get().setIsFetching(false);
    }
  },

  createKbcolumn: async (userId, projectId, kbname) => {
    get().setIsLoading(true);
    consolInfo("#API:KANBAN (CREATE)", "(PROCESS) Creating kbcolumn..");

    try {
      const execute = await todoKanbanAPI.createKbcolumn({
        userId,
        projectId,
        kbname,
      });

      get().addKbcolumn(execute.data.public_id, execute.data);

      consolInfo("#API:KANBAN (CREATE)", "(SUCCESS) Kbcolumn created");
      return execute;
    } catch (err) {
      consolError("#API:KANBAN (CREATE)", err.message);
      throw err;
    } finally {
      get().setIsLoading(false);
    }
  },

  //..........//

  clearAll: () =>
    set({
      kbcolumns: {},
      loaded: false,
      error: null,
      isLoading: false,
      isFetching: false,
    }),

  //..........//
}));
