import { useState, useRef, useMemo } from "react";
import { useSearchParams } from "react-router";

import { useProjectStore } from "@store/dashboard/todo/projectStore";

import DatePicker from "react-datepicker";
import { es } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";

import { VscCloseAll } from "react-icons/vsc";
import { AiTwotoneDelete } from "react-icons/ai";
import { FaPlus } from "react-icons/fa6";
import { MdModeEdit, MdError } from "react-icons/md";
import { TbWashDrycleanOff } from "react-icons/tb";
import { FaRegSave } from "react-icons/fa";
import { PiEmptyLight } from "react-icons/pi";

import useHandleActions from "./useHandleActions";
import { useSublistData } from "./useSublistData";
import styles from "./TodoTaskBoard.module.css";
import "./datePicker.css";

//====================//

const DATETIME_FORMAT = new Intl.DateTimeFormat("es", {
  dateStyle: "long",
  timeStyle: "short",
  hour12: true,
});

//====================//

export default function TodoTaskBoard({ taskId, currentTask, onCommand }) {
  //..........//

  const isOpen = !!currentTask;

  const boardStyle = useMemo(
    () => ({
      transform: `translateX(${isOpen ? "0" : "100"}%)`,
    }),
    [isOpen],
  );

  //..........//

  return (
    <div className={styles.taskBoard} style={boardStyle}>
      {currentTask ? (
        <TaskBoardContent
          key={taskId}
          taskId={taskId}
          currentTask={currentTask}
          onCommand={onCommand}
        />
      ) : (
        "DATA_NOT_FOUND"
      )}
    </div>
  );
}

//====================//

function TaskBoardContent({ taskId, currentTask, onCommand }) {
  //..........//

  const [, setSearchParams] = useSearchParams();

  const projectsData = useProjectStore((state) => state.projects);

  const [datePickerData, setDatePickerData] = useState(null);
  const [projectSelector, setProjectSelector] = useState(false);

  const titleRef = useRef(null);
  const datePickerRef = useRef(null);
  const descriptorRef = useRef(null);

  //..........//

  const {
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
  } = useHandleActions({ taskId, onCommand });

  const { sublistData, addItem, removeItem, updateItem, restoreItems } =
    useSublistData(currentTask);

  //..........//

  const getStoredExpiresAt = () =>
    currentTask.expires_at ? new Date(currentTask.expires_at) : null;

  const handleAddItem = (value, evnt) => {
    if (evnt.key === "Enter" && value.trim()) {
      const newSublist = addItem(value);
      evnt.target.value = "";
      handleSublistUpdate(newSublist, restoreItems);
    }
  };

  const handleRemoveItem = (itemId) => {
    const newSublist = removeItem(itemId);
    handleSublistUpdate(newSublist, restoreItems);
  };

  const handleUpdateItem = (itemId, updates) => {
    const newSublist = updateItem(itemId, updates);
    handleSublistUpdate(newSublist, restoreItems);
  };

  //..........//

  return (
    <>
      <VscCloseAll className={styles.closeIcon} onClick={handleCloseClick} />

      <AiTwotoneDelete
        className={styles.deleteIcon}
        onClick={handleDeleteClick}
      />

      <input
        type="text"
        key={"title" + currentTask.table_id}
        ref={titleRef}
        className={styles.title}
        style={titleIsUpdating ? { opacity: ".5" } : null}
        defaultValue={currentTask.title}
        onDoubleClick={() => {
          titleRef.current.readOnly = false;
          titleRef.current.setSelectionRange(
            titleRef.current.value.length,
            titleRef.current.value.length,
          );
        }}
        onKeyUp={(evnt) =>
          evnt.key === "Enter" && !titleIsUpdating
            ? handleUpdateTitle(evnt.target.value, () => {
                evnt.target.value = currentTask.title;
              })
            : null
        }
        onFocus={() => (titleRef.current.readOnly = true)}
        readOnly={false}
      />

      <br />

      {currentTask.edited_at && (
        <p className={styles.time}>
          <span>
            <MdModeEdit />
            &nbsp;EDITADO
          </span>
          {DATETIME_FORMAT.format(new Date(currentTask.edited_at))}
        </p>
      )}

      <p className={styles.time}>
        <span>
          <FaPlus />
          &nbsp;CREADO
        </span>
        {DATETIME_FORMAT.format(new Date(currentTask.created_at))}
      </p>

      <br />
      <br />

      <div className={styles.lineconf}>
        <i
          onClick={
            !expiresIsUpdating
              ? () => datePickerRef.current.setOpen(true)
              : null
          }
        >
          Fecha de vencimiento
          <DatePicker
            ref={datePickerRef}
            selected={datePickerData}
            onChange={(date) => setDatePickerData(date)}
            onCalendarOpen={() => setDatePickerData(getStoredExpiresAt())}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            timeCaption="Hora"
            locale={es}
            customInput={<div style={{ display: "none" }} />}
          >
            <button
              type="button"
              className={styles.cleanDatePicker}
              onClick={(evnt) => {
                evnt.stopPropagation();
                datePickerRef.current.setOpen(false);
                handleUpdateExpiresAt(datePickerData, () =>
                  setDatePickerData(getStoredExpiresAt()),
                );
              }}
            >
              <FaRegSave /> &nbsp;&nbsp;Actualizar
            </button>
            {datePickerData && (
              <button
                type="button"
                className={styles.cleanDatePicker}
                onClick={() => setDatePickerData(null)}
              >
                <TbWashDrycleanOff /> &nbsp;&nbsp;Eliminar fecha
              </button>
            )}
          </DatePicker>
        </i>
        <p
          style={Object.assign(
            { width: "150px" },
            expiresIsUpdating ? { opacity: ".5" } : {},
          )}
        >
          {currentTask.expires_at ? (
            DATETIME_FORMAT.format(new Date(currentTask.expires_at))
          ) : (
            <>
              <PiEmptyLight /> &nbsp;&nbsp;NO DEFINIDO
            </>
          )}
        </p>
      </div>

      <div className={styles.lineconf}>
        <i style={{ position: "relative" }}>
          <span
            onClick={
              !projectIsUpdating
                ? () => setProjectSelector(!projectSelector)
                : null
            }
          >
            Ubicación
          </span>
          {projectSelector && (
            <select
              className={styles.projectsListSelector}
              defaultValue={currentTask.project_id || ""}
              onChange={(evnt) =>
                handleUpdateProject(evnt.target.value, setProjectSelector)
              }
            >
              <option value="null">SIN DEFINIR</option>
              {Object.entries(projectsData).map(([projectId, projectData]) => (
                <option key={projectId} value={projectId}>
                  {projectData.pname}
                </option>
              ))}
            </select>
          )}
        </i>
        <p
          style={projectIsUpdating ? { opacity: ".5" } : {}}
          onClick={() => {
            setSearchParams((prevParams) => {
              prevParams.set("project", currentTask.project_id);
              return prevParams;
            });
          }}
        >
          {currentTask.project_id ? (
            projectsData[currentTask.project_id]?.pname
          ) : (
            <>
              <PiEmptyLight /> &nbsp;&nbsp;NO DEFINIDO
            </>
          )}
        </p>
      </div>

      <br />
      <br />

      <i>
        Metas
        <span>
          {
            [
              null,
              <>
                <MdModeEdit /> &nbsp;cargando...
              </>,
              <>
                <MdError /> &nbsp;error al actualizar
              </>,
            ][sublistIsUpdating]
          }
        </span>
      </i>
      <div className={styles.sublist}>
        {sublistData.map((itemData) => (
          <div key={itemData.id}>
            <input
              type="checkbox"
              checked={itemData.isChecked}
              onChange={() =>
                handleUpdateItem(itemData.id, {
                  isChecked: !itemData.isChecked,
                })
              }
            />

            <input
              type="text"
              placeholder="..."
              value={itemData.subtitle}
              onChange={(evnt) =>
                updateItem(itemData.id, { subtitle: evnt.target.value })
              }
              onKeyDown={(evnt) => {
                if (evnt.key === "Backspace" && !itemData.subtitle) {
                  handleRemoveItem(itemData.id);
                }
              }}
              onBlur={() => handleSublistUpdate(sublistData, restoreItems)}
            />
          </div>
        ))}
        <input
          type="text"
          placeholder="+ Agregar nueva meta"
          style={{ backgroundColor: "transparent", paddingLeft: "30px" }}
          onKeyDown={(evnt) => handleAddItem(evnt.target.value, evnt)}
        />
      </div>

      <br />
      <br />

      <i>
        Descripción
        <span>
          {
            [
              null,
              <>
                <MdModeEdit /> &nbsp;cargando...
              </>,
              <>
                <MdError /> &nbsp;error al actualizar
              </>,
            ][descriptionBeUpdating]
          }
        </span>
      </i>
      <textarea
        key={"descriptor" + currentTask.table_id}
        ref={descriptorRef}
        className={styles.description}
        defaultValue={currentTask.descriptor}
        placeholder="..."
        rows={10}
        onChange={(evnt) =>
          handleUpdateDescription(evnt.target.value, () => {
            evnt.target.value = currentTask.descriptor;
          })
        }
      />

      <br />
    </>
  );
}
