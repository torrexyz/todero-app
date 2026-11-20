import { useState } from "react";
import { useSearchParams } from "react-router";

import { useDebouncedSave } from "./useDebouncedSave";

//====================//

export default function useHandleActions({ taskId, onCommand }) {
  //..........//

  const [, setSearchParams] = useSearchParams();

  const [titleIsUpdating, setTitleIsUpdating] = useState(false);
  const [expiresIsUpdating, setExpiresIsUpdating] = useState(false);
  const [projectIsUpdating, setProjectIsUpdating] = useState(false);
  const [sublistIsUpdating, setSublistIsUpdating] = useState(0);
  const [descriptionBeUpdating, setDescriptionBeUpdating] = useState(0);

  //..........//

  const descriptorSave = useDebouncedSave(
    async (newDescription, restoreDescription) => {
      setDescriptionBeUpdating(1);

      try {
        await onCommand(
          "set-task",
          `${taskId} @descriptor ${newDescription || "null"}`,
        );
        setDescriptionBeUpdating(0);
      } catch {
        setDescriptionBeUpdating(2);
        restoreDescription?.();
      }
    },
    2500,
  );

  const sublistSave = useDebouncedSave(
    async (newSublistData, restoreSublist) => {
      setSublistIsUpdating(1);

      try {
        await onCommand(
          "set-task",
          `${taskId} @sublist ${JSON.stringify(newSublistData)}`,
        );
        setSublistIsUpdating(0);
      } catch {
        setSublistIsUpdating(2);
        restoreSublist?.();
      }
    },
    2500,
  );

  //..........//

  const handleCloseClick = () => {
    setSearchParams((prevParams) => {
      prevParams.delete("task");
      return prevParams;
    });
  };

  const handleDeleteClick = () => {
    if (confirm("¿Deseas eliminar esta tarea?")) {
      descriptorSave.cancel();
      sublistSave.cancel();
      onCommand("delete-task", `${taskId}`);
    }
  };

  //..........//

  const handleUpdateTitle = async (newTitle, restoreTitlte) => {
    setTitleIsUpdating(true);

    try {
      await onCommand("set-task", `${taskId} @title ${newTitle}`);
    } catch {
      alert("¡Oops! Ocurrió un error al intentar actualizar el título.");
      restoreTitlte();
    } finally {
      setTitleIsUpdating(false);
    }
  };

  const handleUpdateExpiresAt = async (date, restorePickerDate) => {
    setExpiresIsUpdating(true);

    try {
      await onCommand(
        "set-task",
        `${taskId} @expires_at ${date && date.toISOString()}`,
      );
    } catch {
      alert(
        "¡Oops! Ocurrió un error al intentar actualizar la fecha de vencimiento.",
      );
      restorePickerDate();
    } finally {
      setExpiresIsUpdating(false);
    }
  };

  const handleUpdateProject = async (
    projectId,
    setProjectSelector,
    restoreProject,
  ) => {
    setProjectIsUpdating(true);

    try {
      await onCommand("set-task", `${taskId} @project_id ${projectId}`);
    } catch {
      alert("¡Oops! Ocurrió un error al intentar actualizar la ubicación.");
      restoreProject?.();
    } finally {
      setProjectSelector(false);
      setProjectIsUpdating(false);
    }
  };

  const handleUpdateDescription = (newDescription, restoreDescription) => {
    setDescriptionBeUpdating(0);
    descriptorSave.schedule(newDescription, restoreDescription);
  };

  const handleSublistUpdate = (newSublistData, restoreSublist) => {
    sublistSave.schedule(newSublistData, restoreSublist);
  };

  //..........//

  return {
    handleCloseClick,
    handleDeleteClick,
    handleUpdateTitle,
    handleUpdateExpiresAt,
    handleUpdateProject,
    handleSublistUpdate,
    handleUpdateDescription,

    titleIsUpdating,
    expiresIsUpdating,
    projectIsUpdating,
    sublistIsUpdating,
    descriptionBeUpdating,
  };

  //..........//
}
