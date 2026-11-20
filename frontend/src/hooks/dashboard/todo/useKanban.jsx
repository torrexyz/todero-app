import { useEffect, useMemo } from "react";

import { useAuth } from "@context/AuthContext";
import { useKanbanStore } from "@store/dashboard/todo/kanbanStore";

//====================//

export function useTodoKanban({ autoFetch = false, projectId } = {}) {
  //..........//

  const { sessdata } = useAuth();
  const userId = sessdata?.userId;

  //..........//

  const fetchKbcolumns = useKanbanStore((state) => state.fetchKbcolumns);
  const createKbcolumn = useKanbanStore((state) => state.createKbcolumn);

  //..........//

  useEffect(() => {
    if (autoFetch && userId && projectId)
      fetchKbcolumns(userId, projectId).catch(() => null);
  }, [autoFetch, userId, projectId, fetchKbcolumns]);

  //..........//

  return useMemo(
    () => ({
      refreshKanban: () =>
        fetchKbcolumns(userId, projectId, true).catch(() => null),

      createKbcolumn: (kbProjectId, kbname) =>
        createKbcolumn(userId, kbProjectId, kbname),

      deleteKbcolumn: () =>
        null//deleteKbcolumn(),
    }),
    [userId, projectId, fetchKbcolumns, createKbcolumn],
  );
}
