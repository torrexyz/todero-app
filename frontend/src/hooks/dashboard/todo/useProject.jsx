import { useEffect, useMemo } from "react";

import { useAuth } from "@context/AuthContext";
import { useProjectStore } from "@store/dashboard/todo/projectStore";

//====================//

export function useTodoProject({ autoFetch = false } = {}) {
  //..........//

  const { sessdata } = useAuth();
  const userId = sessdata?.userId;

  //..........//

  const fetchProjects = useProjectStore((state) => state.fetchProjects);
  const createProject = useProjectStore((state) => state.createProject);
  const deleteProject = useProjectStore((state) => state.deleteProject);

  //..........//

  useEffect(() => {
    if (autoFetch && userId) fetchProjects(userId).catch(() => null);
  }, [autoFetch, userId, fetchProjects]);

  //..........//

  return useMemo(
    () => ({
      refreshProjects: () =>
        fetchProjects(userId, true).catch(() => null),

      createProject: (pname) =>
        createProject(userId, pname),
      
      deleteProject: (projectId, removeDelay) =>
        deleteProject(userId, projectId, removeDelay),
    }),
    [userId, fetchProjects, createProject, deleteProject],
  );
}
