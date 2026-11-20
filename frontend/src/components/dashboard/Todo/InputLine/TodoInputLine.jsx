import { useState, useRef } from "react";

import { LuLoader } from "react-icons/lu";

import COMMAND_LIST_DATA from "./commandListData";
import HelpPopup from "./HelpPopup";
import styles from "./TodoInputLine.module.css";

//====================//

export default function TodoInputLine({ onCommand }) {
  //..........//

  const [matchesList, setMatchesList] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showHelp, setShowHelp] = useState(false);

  const [executeIsLoading, setExecuteIsloading] = useState(false);
  const inputLineRef = useRef(null);
  const matchesListRef = useRef(null);

  //..........//

  const emptySuggestList = () => {
    setMatchesList([]);
    setSelectedIndex(-1);
  };

  const executeCommand = async (string, auxcalls) => {
    const parts = string.trim().split(" ");
    const name = parts[0].slice(1);
    const args = parts.slice(1).join(" ");

    if (COMMAND_LIST_DATA[name]) {
      emptySuggestList();

      if (name === "help") {
        inputLineRef.current.value = "";
        setShowHelp(true);
        return;
      }

      setExecuteIsloading(true);
      inputLineRef.current.disabled = true;

      try {
        const execute = await onCommand(name, args);

        COMMAND_LIST_DATA[name]?.auxcall?.(execute);
        inputLineRef.current.value = "";
        emptySuggestList();

        auxcalls?.onSuccess?.();
      } catch (err) {
        auxcalls?.onError?.(err);
      } finally {
        setExecuteIsloading(false);
        inputLineRef.current.disabled = false;
        auxcalls?.onFinished?.();
      }
    }
  };

  //..........//

  const handleInputChange = () => {
    const value = inputLineRef.current.value.split(" ", 1)[0];

    const suggestions = ((input) => {
      let trimmedInput = input.trim().toLowerCase();

      if (trimmedInput.startsWith("/")) {
        trimmedInput = trimmedInput.slice(1);
      } else return [];

      return Object.entries(COMMAND_LIST_DATA)
        .filter(([command]) => command.toLowerCase().startsWith(trimmedInput))
        .map(([command, data]) => ({
          command,
          args: data.args,
          description: data.description,
          usage: data.usage,
        }));
    })(value);

    setMatchesList(suggestions);
    setSelectedIndex(-1);
  };

  const handleHelpPick = (command) => {
    inputLineRef.current.value = `/${command} `;
    inputLineRef.current.focus();
    handleInputChange();
  };

  const handleKeyDown = (evnt) => {
    if (matchesList.length > 0) {
      switch (evnt.key) {
        case "ArrowDown":
          evnt.preventDefault();
          setSelectedIndex((prev) =>
            prev < matchesList.length - 1 ? prev + 1 : 0,
          );
          break;

        case "ArrowUp":
          evnt.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : matchesList.length - 1,
          );
          break;

        case "Tab":
          evnt.preventDefault();
          if (selectedIndex >= 0) {
            inputLineRef.current.value = `/${matchesList[selectedIndex].command}${matchesList[selectedIndex].args ? " " : ""}`;
            handleInputChange();
          }
          break;

        case "Enter":
          evnt.preventDefault();
          if (selectedIndex >= 0) {
            inputLineRef.current.value = `/${matchesList[selectedIndex].command} `;
          } else if (matchesList.length === 1) {
            if (matchesList[0].args) {
              if (
                !evnt.target.value
                  .slice(1)
                  .startsWith(matchesList[0].command + " ")
              ) {
                inputLineRef.current.value = `/${matchesList[0].command} `;
              } else if (
                evnt.target.value
                  .slice(1)
                  .substr(matchesList[0].command.length + 1)
                  .trim().length > 0
              ) {
                executeCommand(evnt.target.value);
              }
            } else {
              executeCommand(evnt.target.value);
            }
          }
          handleInputChange();
          break;

        case "Escape":
          emptySuggestList();
          break;
      }
    } else if (evnt.key === "Enter") {
      if (!evnt.target.value.startsWith("/") && evnt.target.value.length > 0)
        executeCommand(`/create-task ${evnt.target.value}`);
    }
  };

  //..........//

  return (
    <div className={styles.inputLine}>
      <input
        type="text"
        placeholder="+ Añade una tarea [Enter] o escribe /help"
        ref={inputLineRef}
        onChange={handleInputChange}
        onClick={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          setTimeout(() => {
            if (
              matchesListRef.current &&
              inputLineRef.current !== document.activeElement
            )
              emptySuggestList();
          }, 100);
        }}
        onFocus={() => {
          if (matchesListRef.current) handleInputChange();
        }}
      />

      {matchesList.length > 0 && (
        <div className={styles.matchesBox} ref={matchesListRef}>
          {matchesList.map((match, index) => (
            <div
              key={match.command}
              className={`${styles.matchItem} ${
                index === selectedIndex ? styles.selected : ""
              }`}
              onClick={() => {
                inputLineRef.current.focus();
                inputLineRef.current.value = `/${match.command} `;
                handleInputChange();
              }}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div>
                <span className={styles.command}>{match.command}</span>
                <span className={styles.usage}>{match.usage}</span>
              </div>
              <div className={styles.description}>{match.description}</div>
            </div>
          ))}
        </div>
      )}

      {executeIsLoading && (
        <>
          <p className={styles.itsLoading}>
            <LuLoader /> &nbsp;&nbsp;Cargando...
          </p>
        </>
      )}

      {showHelp && (
        <HelpPopup onClose={() => setShowHelp(false)} onPick={handleHelpPick} />
      )}
    </div>
  );
}
