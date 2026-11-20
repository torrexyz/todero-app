import { Link } from "react-router";

import { useProjectStore } from "@store/dashboard/todo/projectStore";
import { useTodoProject } from "@hooks/dashboard/todo/useProject";

import DEFAULT_FILTERS from "@constants/dashboard/todo/defaultFilters";

import { ImFilesEmpty } from "react-icons/im";
import { VscBracketError } from "react-icons/vsc";
import { MdOutlineCloudDownload } from "react-icons/md";

import styles from "./TodoAsideList.module.css";

//====================//

export default function TodoAsideList() {
  //..........//

  const projectsData = useProjectStore((state) => state.projects);
  const projectError = useProjectStore((state) => state.error);
  const projectIsFetching = useProjectStore((state) => state.isFetching);

  const { refreshProjects } = useTodoProject();

  let skipEmptyProjects = false;
  if (Object.keys(projectsData).length === 0) skipEmptyProjects = true;

  //..........//

  return (
    <>
      <ul className={styles.asideList}>
        {Object.entries(DEFAULT_FILTERS).map(([filterId, filterObj]) => (
          <li key={filterId}>
            <Link to={{ search: "?filter=" + filterId }}>
              {filterObj.element}
            </Link>
          </li>
        ))}

        <hr />

        {!projectError ? (
          !projectIsFetching ? (
            !skipEmptyProjects ? (
              Object.entries(projectsData).map(([projectId, projectData]) => {
                return (
                  <li key={projectId}>
                    <Link to={{ search: "?project=" + projectId }}>
                      {projectData.pname}
                    </Link>
                  </li>
                );
              })
            ) : (
              <li>
                <ImFilesEmpty /> &nbsp;&nbsp;Sin proyectos..
              </li>
            )
          ) : (
            <li>
              <MdOutlineCloudDownload /> &nbsp;&nbsp;Cargando proyectos..
            </li>
          )
        ) : (
          <li onClick={refreshProjects}>
            <VscBracketError /> &nbsp;&nbsp;Error de carga
          </li>
        )}
      </ul>
    </>
  );
}
