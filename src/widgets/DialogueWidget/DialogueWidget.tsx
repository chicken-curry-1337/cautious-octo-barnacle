import styles from "./DialogueWidget.module.css";
import { DialogueStore } from "../../entities/Dialogue/Dialogue.store";
import { useMemo } from "react";
import { container } from "tsyringe";
import { observer } from "mobx-react-lite";

export const DialogueWidget = observer(() => {
  const dialogueStore = useMemo(() => container.resolve(DialogueStore), []);
  const currentNode = dialogueStore.currentNode;
  const characters = dialogueStore.characters;

  const handleDialogueClick = () => {
    if (!currentNode) return;

    if (currentNode.options.length === 1) {
      dialogueStore.setCurrentId(currentNode.options[0].nextId);
    } else if (currentNode.options.length === 0) {
      // Диалог закончился — закрываем
      dialogueStore.clearDialogue();
    }
  };

  if (!currentNode || !characters) return null;

  return (
    <div className={styles.container}>
      <div className={styles.characters}>
        {characters.map((char) => {
          // Активен, если его id есть в массиве activeCharacterIds
          const isActive = currentNode.activeCharacterIds.includes(char.id);
          return (
            <img
              key={char.id}
              src={char.avatarUrl}
              alt={char.name}
              title={char.name}
              className={`${styles.characterImg} ${
                isActive ? styles.characterImgActive : styles.characterImgInactive
              }`}
            />
          );
        })}
      </div>

      <div
        className={styles.text}
        onClick={handleDialogueClick}
        style={{ cursor: currentNode.options.length <= 1 ? "pointer" : "default" }}
        title={
          currentNode.options.length === 1
            ? "Клик для продолжения"
            : currentNode.options.length === 0
            ? "Клик для закрытия диалога"
            : undefined
        }
      >
        {currentNode.text}
      </div>

      <div className={styles.options}>
        {currentNode.options.length > 1 &&
          currentNode.options.map((option, index) => (
            <button
              key={index}
              onClick={() => dialogueStore.setCurrentId(option.nextId)}
              className={styles.button}
            >
              {option.text}
            </button>
          ))}
      </div>
    </div>
  );
});
