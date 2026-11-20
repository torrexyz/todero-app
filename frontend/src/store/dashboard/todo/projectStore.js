import { create } from "zustand";

import todoProjectAPI from "@services/dashboard/todo/useProject";

import { normalizeById } from "@utils/normalizeById";
import { consolInfo, consolWarn, consolError } from "@utils/consol";

//====================//

export const useProjectStore = create((set, get) => ({
  //..........//

  projects: {},
  loaded: false,
  error: null,
  isLoading: false,
  isFetching: false,

  //..........//

  setProjects: (projects) => set(() => ({ projects, loaded: true })),

  setError: (error) => set({ error }),

  setIsLoading: (isLoading) => set({ isLoading }),

  setIsFetching: (isFetching) => set({ isFetching }),

  //..........//

  addProject: (id, data) =>
    set((state) => ({
      projects: { ...state.projects, [id]: data },
    })),

  removeProject: (id) =>
    set((state) => {
      const newProjects = { ...state.projects };
      delete newProjects[id];
      return { projects: newProjects };
    }),

  modifyProject: (id, data) =>
    set((state) => ({
      projects: {
        ...state.projects,
        [id]: { ...state.projects[id], ...data },
      },
    })),

  //..........//

  fetchProjects: async (userId, force = false) => {
    const projectStore = get();

    if (!force && projectStore.loaded) {
      consolWarn("#API:PROJECTS (FETCH)", "(CACHE) Data already loaded");
      return;
    }

    if (projectStore.isFetching) {
      consolWarn(
        "#API:PROJECTS (FETCH)",
        "(ABORT) Previous fetch not finished",
      );
      return;
    }

    projectStore.setError(null);
    projectStore.setIsFetching(true);
    consolInfo("#API:PROJECTS (FETCH)", "(PROCESS) Fetching data..");

    try {
      const execute = await todoProjectAPI.fetchProjects({ userId });

      get().setProjects(normalizeById(execute.data));

      consolInfo("#API:PROJECTS (FETCH)", "(SUCCESS) Data fetched");
      return execute;
    } catch (err) {
      consolError("#API:PROJECTS (FETCH)", err.message);
      get().setError(err.message);
      throw err;
    } finally {
      get().setIsFetching(false);
    }
  },

  createProject: async (userId, pname) => {
    get().setIsLoading(true);
    consolInfo("#API:PROJECTS (CREATE)", "(PROCESS) Creating project..");

    try {
      const execute = await todoProjectAPI.createProject({ userId, pname });

      get().addProject(execute.data.public_id, execute.data);

      consolInfo("#API:PROJECTS (CREATE)", "(SUCCESS) Project created");
      return execute;
    } catch (err) {
      consolError("#API:PROJECTS (CREATE)", err.message);
      throw err;
    } finally {
      get().setIsLoading(false);
    }
  },

  deleteProject: async (userId, projectId, removeDelay = 0) => {
    get().setIsLoading(true);
    consolInfo("#API:PROJECTS (DELETE)", "(PROCESS) Deleting project..");

    try {
      const execute = await todoProjectAPI.deleteProject({
        userId,
        projectId,
      });

      if (removeDelay)
        setTimeout(() => get().removeProject(projectId), removeDelay);
      else get().removeProject(projectId);

      consolInfo("#API:PROJECTS (DELETE)", "(SUCCESS) Project deleted");
      return execute;
    } catch (err) {
      consolError("#API:PROJECTS (DELETE)", err.message);
      throw err;
    } finally {
      get().setIsLoading(false);
    }
  },

  //..........//

  clearAll: () =>
    set({
      projects: {},
      loaded: false,
      error: null,
      isLoading: false,
      isFetching: false,
    }),

  //..........//
}));
