import COMMAND_LIST_DATA from "./commandListData";
import styles from "./TodoInputLine.module.css";

//====================//

export default function HelpPopup({ onClose, onPick }) {
  return (
    <>
      <div className={styles.helpInfoPopup} onClick={onClose}>
        <div className={styles.matchesBox} style={{ position: "unset" }}>
          {Object.entries(COMMAND_LIST_DATA).map(
            ([command, data]) =>
              command !== "help" && (
                <div
                  key={command}
                  className={styles.matchItem}
                  onClick={() => onPick(command)}
                >
                  <div>
                    <span className={styles.command}>{command}</span>
                    <span className={styles.usage}>{data.usage}</span>
                  </div>
                  <div className={styles.description}>{data.description}</div>
                </div>
              ),
          )}
        </div>
      </div>
    </>
  );
}
